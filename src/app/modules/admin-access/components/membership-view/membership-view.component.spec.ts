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
import { MembershipStoreActions, MembershipStoreReducer, RootStoreState } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
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
  let store: Store<RootStoreState.State>;
  let router: Router;
  let routerListener: jest.MockInstance<Promise<boolean>, any[]>;

  beforeEach(async(() => {
    membership = new Membership().deserialize(factory.membership());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            membership: MembershipStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                membership: membership
              },
              params: {
                slug: membership.slug
              }
            }
          }
        }
      ],
      declarations: [MembershipViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(MembershipViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when membership name is changed', fakeAsync(() => {
    store.dispatch(MembershipStoreActions.getMembershipSuccess({ membership }));
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const membershipWithNewName = new Membership().deserialize({
      ...(membership as any),
      ...newNameAndSlug
    });

    const modalService = TestBed.get(NgbModal);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(MembershipStoreActions.updateMembershipSuccess({ membership: membershipWithNewName }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['..', membershipWithNewName.slug]);
  }));

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<MembershipViewComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(MembershipStoreActions.getMembershipSuccess({ membership }));
      };
      context.componentValidateInitialization = () => undefined;
      context.successAction = MembershipStoreActions.updateMembershipSuccess({ membership });
      context.createExpectedFailureAction = error =>
        MembershipStoreActions.updateMembershipFailure({ error });
      context.duplicateAttibuteValueError = 'name already used';
    });

    describe('when updating name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = newName;
        context.updateEntity = () => {
          component.updateName();
        };

        const membershipWithUpdatedSlug = new Membership().deserialize({
          ...(membership as any),
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'name',
          value: newName
        });
        context.successAction = MembershipStoreActions.updateMembershipSuccess({
          membership: membershipWithUpdatedSlug
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating description', () => {
      beforeEach(() => {
        const newValue = faker.lorem.paragraphs();
        context.modalReturnValue = newValue;
        context.updateEntity = () => {
          component.updateDescription();
        };

        context.expectedSuccessAction = MembershipStoreActions.updateMembershipRequest({
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
          store.dispatch(MembershipStoreActions.getMembershipSuccess({ membership }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntity: (): void => {
          store.dispatch(MembershipStoreActions.updateMembershipSuccess({ membership }));
          fixture.detectChanges();
        },
        dispatchUpdatedParentEntityWithError: (error: any): void => {
          store.dispatch(MembershipStoreActions.updateMembershipFailure({ error }));
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
              expect(storeListener.mock.calls[0][0]).toEqual(
                MembershipStoreActions.updateMembershipRequest({
                  membership,
                  attributeName: 'userAdd',
                  value: user.id
                })
              );
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
              expect(storeListener.mock.calls[0][0]).toEqual(
                MembershipStoreActions.updateMembershipRequest({
                  membership,
                  attributeName: 'userRemove',
                  value: user.id
                })
              );
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
              expect(storeListener.mock.calls[0][0]).toEqual(
                MembershipStoreActions.updateMembershipRequest({
                  membership,
                  attributeName: 'studyAdd',
                  value: study.id
                })
              );
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
              ...(membership as any),
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
                expect(storeListener.mock.calls[0][0]).toEqual(
                  MembershipStoreActions.updateMembershipRequest({
                    membership,
                    attributeName: 'studyRemove',
                    value: study.id
                  })
                );
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);
        });

        describe('and membership has NO studies', () => {
          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...(membership as any),
              studyData: {
                ...membership.studyData,
                entityData: []
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0]).toEqual(
                  MembershipStoreActions.updateMembershipRequest({
                    membership,
                    attributeName: 'allStudies'
                  })
                );
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
              expect(storeListener.mock.calls[0][0]).toEqual(
                MembershipStoreActions.updateMembershipRequest({
                  membership,
                  attributeName: 'centreAdd',
                  value: centre.id
                })
              );
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
              ...(membership as any),
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
                expect(storeListener.mock.calls[0][0]).toEqual(
                  MembershipStoreActions.updateMembershipRequest({
                    membership,
                    attributeName: 'centreRemove',
                    value: centre.id
                  })
                );
              }
            });
          });

          EntityWithSubEntityBehaviour.removeSharedBehaviour(subContext);
        });

        describe('and membership has NO studies', () => {
          const subContext: EntityWithSubEntityBehaviour.RemoveContext = {} as any;

          beforeEach(() => {
            membership = new Membership().deserialize({
              ...(membership as any),
              centreData: {
                ...membership.centreData,
                entityData: []
              }
            });
            Object.assign(subContext, context, {
              checkRemoveUpdateRequest: (storeListener: any) => {
                expect(storeListener.mock.calls.length).toBe(1);
                expect(storeListener.mock.calls[0][0]).toEqual(
                  MembershipStoreActions.updateMembershipRequest({
                    membership,
                    attributeName: 'allCentres'
                  })
                );
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
      store.dispatch(MembershipStoreActions.getMembershipSuccess({ membership }));
      fixture.detectChanges();

      modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({ result: Promise.resolve('OK') });
    });

    it('dispatches an event', fakeAsync(() => {
      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.removeMembership();
      flush();
      fixture.detectChanges();

      const action = MembershipStoreActions.removeMembershipRequest({ membership });
      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(action);
    }));

    it('new page is displayed', fakeAsync(() => {
      component.removeMembership();
      flush();
      fixture.detectChanges();

      const action = MembershipStoreActions.removeMembershipSuccess({ membershipId: membership.id });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual(['..']);
    }));
  });
});
