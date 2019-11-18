import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreUpdateAttribute } from '@app/core/services';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, RootStoreState } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreSummaryComponent } from './centre-summary.component';
import { TestUtils } from '@test/utils';

describe('CentreSummaryComponent', () => {
  let component: CentreSummaryComponent;
  let fixture: ComponentFixture<CentreSummaryComponent>;
  let store: Store<RootStoreState.State>;
  let router: Router;
  let modalService: NgbModal;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  centre: centre
                },
                params: {
                  slug: centre.slug
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [CentreSummaryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(CentreSummaryComponent);
    component = fixture.componentInstance;

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when centre name is changed', fakeAsync(() => {
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    flush();
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const centreWithNewName = new Centre().deserialize({
      ...(centre as any),
      ...newNameAndSlug
    });

    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(CentreStoreActions.updateCentreSuccess({ centre: centreWithNewName }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['../..', centreWithNewName.slug, 'summary']);
  }));

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<CentreSummaryComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      };
      context.componentValidateInitialization = () => undefined;
      context.successAction = CentreStoreActions.updateCentreSuccess({ centre });
      context.createExpectedFailureAction = error => CentreStoreActions.updateCentreFailure({ error });
      context.duplicateAttibuteValueError = 'name already used';
    });

    describe('when updating name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = newName;
        context.updateEntity = () => {
          component.updateName();
        };

        const centreWithUpdatedSlug = new Centre().deserialize({
          ...(centre as any),
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = CentreStoreActions.updateCentreRequest({
          centre,
          attributeName: 'name',
          value: newName
        });
        context.successAction = CentreStoreActions.updateCentreSuccess({ centre: centreWithUpdatedSlug });
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

        context.expectedSuccessAction = CentreStoreActions.updateCentreRequest({
          centre,
          attributeName: 'description',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when DISABLING a centre', () => {
      beforeEach(() => {
        const newValue = 'disable';
        context.updateEntity = () => {
          component.disable();
        };
        context.expectedSuccessAction = CentreStoreActions.updateCentreRequest({
          centre,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when ENABLING a centre', () => {
      beforeEach(() => {
        const newValue = 'enable';
        context.updateEntity = () => {
          component.enable();
        };
        context.expectedSuccessAction = CentreStoreActions.updateCentreRequest({
          centre,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });

  const testData = [
    {
      comonentFunc: () => component.updateName(),
      attribute: 'name',
      value: 'test'
    },
    {
      componentFunc: () => component.updateDescription(),
      attribute: 'description',
      value: 'test'
    }
  ];

  describe.each`
    methodName             | attributeName    | value
    ${'updateName'}        | ${'name'}        | ${'test'}
    ${'updateDescription'} | ${'description'} | ${'test'}
  `('updating $attributeName', ({ methodName, attributeName, value }) => {
    it('should open a modal', fakeAsync(() => {
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      const modalListener = TestUtils.modalOpenListener(value);

      expect(component[methodName]).toBeFunction();
      component[methodName]();
      fixture.detectChanges();
      flush();

      expect(modalListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(
        CentreStoreActions.updateCentreRequest({
          centre,
          attributeName,
          value
        })
      );
    }));
  });

  describe.each`
    methodName             | attributeName    | value
    ${'updateName'}        | ${'name'}        | ${'test'}
    ${'updateDescription'} | ${'description'} | ${'test'}
    ${'disable'}           | ${'state'}       | ${'disable'}
    ${'enable'}            | ${'state'}       | ${'enable'}
  `('when $attributeName is updated', ({ methodName, attributeName, value }) => {
    it('should notify the user when completed', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);

      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(store, 'dispatch');
      TestUtils.modalOpenListener(value);

      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      expect(component[methodName]).toBeFunction();
      component[methodName]();
      fixture.detectChanges();
      flush();
      expect(store.dispatch).toHaveBeenCalled();
      store.dispatch(CentreStoreActions.updateCentreSuccess({ centre }));
      flush();

      expect(toastr.success.mock.calls.length).toBe(1);
    }));
  });

  describe.each`
    methodName   | attributeName | value
    ${'disable'} | ${'state'}    | ${'disable'}
    ${'enable'}  | ${'state'}    | ${'enable'}
  `('when $attributeName is updated', ({ methodName, attributeName, value }) => {
    it('should change the centre state', fakeAsync(() => {
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component[methodName]();
      fixture.detectChanges();
      flush();

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(
        CentreStoreActions.updateCentreRequest({
          centre,
          attributeName: 'state',
          value
        })
      );
    }));
  });
});
