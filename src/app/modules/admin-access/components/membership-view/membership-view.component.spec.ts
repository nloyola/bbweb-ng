import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Membership } from '@app/domain/access';
import { Centre } from '@app/domain/centres';
import { Study } from '@app/domain/studies';
import { User } from '@app/domain/users';
import { MembershipStoreActions, MembershipStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { EntityWithSubEntityBehaviour } from '@test/behaviours/entity-with-sub-entity.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { ToastrModule } from 'ngx-toastr';
import { MembershipViewComponent } from './membership-view.component';

describe('MembershipViewComponent', () => {
  let component: MembershipViewComponent;
  let fixture: ComponentFixture<MembershipViewComponent>;
  const factory = new Factory();
  let membership: Membership;
  let store: Store<MembershipStoreReducer.State>;

  beforeEach(async(() => {
    membership = new Membership().deserialize(factory.membership());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'membership': MembershipStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                slug: membership.slug
              }
            }
          }
        }
      ],
      declarations: [ MembershipViewComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(MembershipViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('membershipEntity and membershipId are resolved correctly', () => {
    store.dispatch(new MembershipStoreActions.GetMembershipSuccess({ membership }));
    fixture.detectChanges();
    expect(component.membershipEntity).toBe(membership);
    expect(component.membershipId).toBe(membership.id);
  });

  it('navigates to new path when membership name is changed', fakeAsync(() => {
    store.dispatch(new MembershipStoreActions.GetMembershipSuccess({ membership }));
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const membershipWithNewName = new Membership().deserialize({
      ...membership as any,
      ...newNameAndSlug
    });

    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const modalService = TestBed.get(NgbModal);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(new MembershipStoreActions.UpdateMembershipSuccess({ membership: membershipWithNewName }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '..', membershipWithNewName.slug ]);
  }));

  describe('when updating attributes', () => {

    const context: EntityUpdateComponentBehaviour.Context<MembershipViewComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(new MembershipStoreActions.GetMembershipSuccess({ membership }));
      };
      context.componentValidateInitialization =
        () => { expect(component.membershipEntity).toEqual(membership); };
      context.dispatchSuccessAction = () => {
        store.dispatch(new MembershipStoreActions.UpdateMembershipSuccess({ membership }));
      };
      context.createExpectedFailureAction =
        (error) => new MembershipStoreActions.UpdateMembershipFailure({ error });
      context.duplicateNameError = 'name already used';
    });

    describe('when updating name', () => {

      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => { component.updateName(); };

        const membershipWithUpdatedSlug = new Membership().deserialize({
          ...membership as any,
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = new MembershipStoreActions.UpdateMembershipRequest({
          membership,
          attributeName: 'name',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(new MembershipStoreActions.UpdateMembershipSuccess({
            membership: membershipWithUpdatedSlug
          }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

    describe('when updating description', () => {

      beforeEach(() => {
        const newValue = faker.lorem.paragraphs();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => { component.updateDescription(); };

        context.expectedSuccessAction = new MembershipStoreActions.UpdateMembershipRequest({
          membership,
          attributeName: 'description',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

  });

  describe('when adding and removing a user, study and centre', () => {

    let baseContext: EntityWithSubEntityBehaviour.BaseContext = {} as any;

    beforeEach(() => {
      baseContext = {
        dispatchParentEntity: (): void => {
          store.dispatch(new MembershipStoreActions.GetMembershipSuccess({ membership }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntity: (): void => {
          store.dispatch(new MembershipStoreActions.UpdateMembershipSuccess({ membership }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntityWithError: (error: any): void => {
          store.dispatch(new MembershipStoreActions.UpdateMembershipFailure({ error }));
          fixture.detectChanges();
        },
        modalReturnValue: {
          componentInstance: {},
          result: Promise.resolve(true)
        }
      };
    });

    describe('for a user', () => {

      const user = new User().deserialize(factory.user());

      describe('when adding', () => {

        const context: EntityWithSubEntityBehaviour.AddContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            addChildEntity: () => {
              component.userAddTypeahead.selected$.next(user);
              fixture.detectChanges();
            },
            checkAddUpdateRequest: (storeListener: any) => {
              expect(storeListener.mock.calls.length).toBe(1);
              expect(storeListener.mock.calls[0][0])
                .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                  membership,
                  attributeName: 'userAdd',
                  value: user.id
                }));
            }
          });
        });

        EntityWithSubEntityBehaviour.addSharedBehaviour(context);
      });

      describe('when removing', () => {

        const context: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            removeChildEntity: () => {
              component.userSelected(user);
              fixture.detectChanges();
            },
            checkRemoveUpdateRequest: (storeListener: any) => {
              expect(storeListener.mock.calls.length).toBe(1);
              expect(storeListener.mock.calls[0][0])
                .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                  membership,
                  attributeName: 'userRemove',
                  value: user.id
                }));
            }
          });
        });

        EntityWithSubEntityBehaviour.removeSharedBehaviour(context);
      });

    });

    describe('for a study', () => {

      const study = new Study().deserialize(factory.study());

      describe('when adding', () => {

        const context: EntityWithSubEntityBehaviour.AddContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            addChildEntity: () => {
              component.studyAddTypeahead.selected$.next(study);
              fixture.detectChanges();
            },
            checkAddUpdateRequest: (storeListener: any) => {
              expect(storeListener.mock.calls.length).toBe(1);
              expect(storeListener.mock.calls[0][0])
                .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                  membership,
                  attributeName: 'studyAdd',
                  value: study.id
                }));
            }
          });

          EntityWithSubEntityBehaviour.addSharedBehaviour(context);
        });

      });

      describe('when removing', () => {

        const context: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            removeChildEntity: () => {
              component.studySelected(study);
              fixture.detectChanges();
            }
          });
        });

        describe('and membership has a study', () => {

          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...membership as any,
              studyData: {
                ...membership.studyData,
                entityData: [
                  ...membership.studyData.entityData,
                  {
                    id: study.id,
                    slug: study.slug,
                    name: study.name
                  }
                ]
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0])
                  .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                    membership,
                    attributeName: 'studyRemove',
                    value: study.id
                  }));
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);

        });

        describe('and membership has NO studies', () => {

          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...membership as any,
              studyData: {
                ...membership.studyData,
                entityData: []
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0])
                  .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                    membership,
                    attributeName: 'allStudies'
                  }));
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);

        });

      });

    });

    describe('for a centre', () => {

      const centre = new Centre().deserialize(factory.centre());

      describe('when adding', () => {

        const context: EntityWithSubEntityBehaviour.AddContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            addChildEntity: () => {
              component.centreAddTypeahead.selected$.next(centre);
              fixture.detectChanges();
            },
            checkAddUpdateRequest: (storeListener: any) => {
              expect(storeListener.mock.calls.length).toBe(1);
              expect(storeListener.mock.calls[0][0])
                .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                  membership,
                  attributeName: 'centreAdd',
                  value: centre.id
                }));
            }
          });

          EntityWithSubEntityBehaviour.addSharedBehaviour(context);
        });

      });

      describe('when removing', () => {

        const context: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

        beforeEach(() => {
          Object.assign(context, baseContext, {
            removeChildEntity: () => {
              component.centreSelected(centre);
              fixture.detectChanges();
            }
          });
        });

        describe('and membership has a centre', () => {

          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...membership as any,
              centreData: {
                ...membership.centreData,
                entityData: [
                  ...membership.centreData.entityData,
                  {
                    id: centre.id,
                    slug: centre.slug,
                    name: centre.name
                  }
                ]
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0])
                  .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                    membership,
                    attributeName: 'centreRemove',
                    value: centre.id
                  }));
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);

        });

        describe('and membership has NO studies', () => {

          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...membership as any,
              centreData: {
                ...membership.centreData,
                entityData: []
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0])
                  .toEqual(new MembershipStoreActions.UpdateMembershipRequest({
                    membership,
                    attributeName: 'allCentres'
                  }));
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);

        });

      });

    });

  });

  describe('when removing an membership', () => {

    let modalService: NgbModal;

    beforeEach(() => {
      store.dispatch(new MembershipStoreActions.GetMembershipSuccess({ membership }));
      fixture.detectChanges();
      expect(component.membershipEntity).toBe(membership);

      modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({ result: Promise.resolve('OK') });
    });

    it('dispatches an event', fakeAsync(() => {
      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.removeMembership();
      flush();
      fixture.detectChanges();

      const action = new MembershipStoreActions.RemoveMembershipRequest({ membership });
      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(action);
    }));

    it('new page is displayed', fakeAsync(() => {
      const router = TestBed.get(Router);
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.removeMembership();
      flush();
      fixture.detectChanges();

      const action = new MembershipStoreActions.RemoveMembershipSuccess({ membershipId: membership.id });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([ '..' ]);
    }));
  });

});
