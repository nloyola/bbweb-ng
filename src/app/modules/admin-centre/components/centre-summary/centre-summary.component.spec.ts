import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer } from '@app/root-store';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreSummaryComponent } from './centre-summary.component';
import { SpinnerStoreReducer } from '@app/root-store/spinner';

describe('CentreSummaryComponent', () => {

  let component: CentreSummaryComponent;
  let fixture: ComponentFixture<CentreSummaryComponent>;
  let ngZone: NgZone;
  let store: Store<CentreStoreReducer.State>;
  let router: Router;
  let modalService: NgbModal;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'centre': CentreStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
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

  it('navigates to new path when centre name is changed', () => {
    const centreWithNewName = new Centre().deserialize({
      ...centre,
      ...factory.nameAndSlug
    });

    const routerListener = jest.spyOn(router, 'navigate');

    ngZone.run(() => store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre: centreWithNewName })));
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '../..', centreWithNewName.slug, 'summary' ]);
  });

  describe('common behaviour', () => {

    /* tslint:disable:no-shadowed-variable */
    const componentModalFuncs = [
      (component) => component.updateName(),
      (component) => component.updateDescription()
    ];
    /* tslint:disable:no-shadowed-variable */

    it('functions should open a modal', fakeAsync(() => {
      const testData = [
        {
          componentFunc: (component) => component.updateName(),
          attribute: 'name',
          value: 'test'
        },
        {
          componentFunc: (component) => component.updateDescription(),
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
        });

        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(new CentreStoreActions.UpdateCentreRequest({
          centre,
          attributeName: testInfo.attribute,
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
      });

      ngZone.run(() => store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre })));
      fixture.detectChanges();

      const componentUpdateFuncs = [
        (component) => component.disable(),
        (component) => component.enable(),
        (component) => component.retire(),
        (component) => component.unretire()
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
        { componentFunc: (component) => component.disable(),  value: 'disable' },
        { componentFunc: (component) => component.enable(),   value: 'enable' }
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
