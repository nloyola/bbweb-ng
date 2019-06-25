import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreLocationAddComponent } from './centre-location-add.component';

describe('CentreLocationAddComponent', () => {
  let component: CentreLocationAddComponent;
  let fixture: ComponentFixture<CentreLocationAddComponent>;
  let ngZone: NgZone;
  let router: Router;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<RootStoreState.State>;
  let toastr: ToastrService;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'spinner': SpinnerStoreReducer.reducer,
            'centre': CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ CentreLocationAddComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(CentreLocationAddComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('assigns the centre when it is changed in the store', () => {
    const centre = createCentre();
    mockActivatedRouteSnapshot('add', centre);

    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));

    fixture.detectChanges();
    expect(component.centre).toEqual(centre);
  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      const centre = createCentre();
      const expectedAction = CentreStoreActions.updateCentreRequest({
        centre,
        attributeName: 'locationAdd',
        value: centre.locations[0]
      });

      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const spy = jest.spyOn(router, 'navigate');

      mockActivatedRouteSnapshot('add', centre);
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      component.onSubmit(centre.locations[0]);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      ngZone.run(() => store.dispatch(CentreStoreActions.updateCentreSuccess({ centre })));

      fixture.whenStable().then(() => {
        expect(store.dispatch).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(['..']);
      });
    }));

    it('on submission failure', fakeAsync(() => {
      const centre = createCentre();
      const testData = [
        { path: 'add', savedMessage: 'Location Added' },
        { path: centre.locations[0].id, savedMessage: 'Location Updated' },
      ];
      const errors = [
        {
          status: 401,
          statusText: 'Unauthorized'
        },
        {
          status: 404,
          error: {
              message: 'simulated error'
          }
        },
        {
          status: 404,
          error: {
            message: 'EntityCriteriaError: name already used'
          }
        }
      ];

      jest.spyOn(toastr, 'error').mockReturnValue(null);
      const routerListener = jest.spyOn(router, 'navigate');

      testData.forEach(testInfo => {
        mockActivatedRouteSnapshot(testInfo.path, centre);
        component.ngOnInit();
        routerListener.mockClear();

        store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
        fixture.detectChanges();

        errors.forEach(error => {
          component.onSubmit(centre.locations[0]);

          store.dispatch(CentreStoreActions.getCentreFailure({ error }));
          flush();
          fixture.detectChanges();

          expect(toastr.error).toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
        });
      });
    }));
  });

  function createCentre(): Centre {
    const location = {
      ...factory.location(),
      id: factory.stringNext()
    };
    return new Centre().deserialize(factory.centre({ locations: [ location ] }));
  }

  function mockActivatedRouteSnapshot(path: string, centre: Centre): void {
    const locationId = (path === 'add') ? undefined : centre.locations[0].id;
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          data: {
            centre
          },
          params: {
            slug: centre.slug
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        slug: centre.slug,
        locationId
      },
      url: [
        { path: '' },
        { path }
      ]
    }));
  }
});
