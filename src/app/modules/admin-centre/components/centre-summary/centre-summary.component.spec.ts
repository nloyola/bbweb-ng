import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreUpdateAttribute } from '@app/core/services';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, RootStoreState } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreSummaryComponent } from './centre-summary.component';

describe('CentreSummaryComponent', () => {

  let component: CentreSummaryComponent;
  let fixture: ComponentFixture<CentreSummaryComponent>;
  let ngZone: NgZone;
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
            'centre': CentreStoreReducer.reducer,
            'spinner': SpinnerStoreReducer.reducer
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
      declarations: [ CentreSummaryComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(CentreSummaryComponent);
    component = fixture.componentInstance;

    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when centre name is changed', fakeAsync(() => {
    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
    flush();
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const centreWithNewName = new Centre().deserialize({
      ...centre as any,
      ...newNameAndSlug
    });

    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre: centreWithNewName }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '../..', centreWithNewName.slug, 'summary' ]);
  }));

  describe('when updating attributes', () => {

    const context: EntityUpdateComponentBehaviour.Context<CentreSummaryComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize =
        () => { store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre })); };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction =
        () => { store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre })); };
      context.createExpectedFailureAction =
        (error) => new CentreStoreActions.UpdateCentreFailure({ error });
      context.duplicateAttibuteValueError = 'name already used';
    });

    describe('when updating name', () => {

      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => { component.updateName(); };

        const centreWithUpdatedSlug = new Centre().deserialize({
          ...centre as any,
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = new CentreStoreActions.UpdateCentreRequest({
          centre,
          attributeName: 'name',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre: centreWithUpdatedSlug }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

    describe('when updating description', () => {

      beforeEach(() => {
        const newValue = faker.lorem.paragraphs();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => { component.updateDescription(); };

        context.expectedSuccessAction = new CentreStoreActions.UpdateCentreRequest({
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
        context.updateEntity = () => { component.disable(); };
        context.expectedSuccessAction = new CentreStoreActions.UpdateCentreRequest({
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
        context.updateEntity = () => { component.enable(); };
        context.expectedSuccessAction = new CentreStoreActions.UpdateCentreRequest({
          centre,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);

    });

  });

  describe('common behaviour', () => {

    const componentModalFuncs = [
      (c: CentreSummaryComponent) => c.updateName(),
      (c: CentreSummaryComponent) => c.updateDescription()
    ];

    it('functions should open a modal', fakeAsync(() => {
      const testData = [
        {
          componentFunc: (c) => c.updateName(),
          attribute: 'name',
          value: 'test'
        },
        {
          componentFunc: (c) => c.updateDescription(),
          attribute: 'description',
          value: 'test'
        }
      ];

      const modalListener = jest.spyOn(modalService, 'open');

      ngZone.run(() => store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre })));
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      testData.forEach((testInfo, index) => {
        modalListener.mockReturnValue({
          componentInstance: {},
          result: Promise.resolve(testInfo.value)
        } as any);

        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(new CentreStoreActions.UpdateCentreRequest({
          centre,
          attributeName: testInfo.attribute as CentreUpdateAttribute,
          value: testInfo.value
        }));
      });
      expect(modalListener.mock.calls.length).toBe(componentModalFuncs.length);
    }));

    it('functions that should notify the user', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);

      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('test')
      } as any);

      ngZone.run(() => store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre })));
      fixture.detectChanges();

      const componentUpdateFuncs = [
        (c: CentreSummaryComponent) => component.disable(),
        (c: CentreSummaryComponent) => component.enable()
      ].concat(componentModalFuncs);

      componentUpdateFuncs.forEach(updateFunc => {
        updateFunc(component);
        fixture.detectChanges();
        tick(1000);
        expect(store.dispatch).toHaveBeenCalled();
        ngZone.run(() => store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre })));
        tick(1000);
      });

      tick(1000);
      expect(toastr.success.mock.calls.length).toBe(componentUpdateFuncs.length);
    }));

    it('functions that change the centre state', fakeAsync(() => {
      ngZone.run(() => store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre })));
      fixture.detectChanges();

      const testData = [
        { componentFunc: (c) => c.disable(),  value: 'disable' },
        { componentFunc: (c) => c.enable(),   value: 'enable' }
      ];

      const storeListener = jest.spyOn(store, 'dispatch');
      testData.forEach((testInfo, index) => {
        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(new CentreStoreActions.UpdateCentreRequest({
          centre,
          attributeName: 'state',
          value: testInfo.value
        }));
      });
    }));
  });
});
