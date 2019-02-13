import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CentreStoreReducer, CentreStoreActions } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreLocationAddComponent } from './centre-location-add.component';
import { Centre } from '@app/domain/centres';
import { cold } from 'jasmine-marbles';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CentreLocationAddComponent', () => {
  let component: CentreLocationAddComponent;
  let fixture: ComponentFixture<CentreLocationAddComponent>;
  let ngZone: NgZone;
  let router: Router;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<CentreStoreReducer.State>;
  let toastr: ToastrService;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'centre': CentreStoreReducer.reducer
        }),
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

    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));

    fixture.detectChanges();
    expect(component.centre).toEqual(centre);
  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      const centre = createCentre();
      const expectedAction = new CentreStoreActions.UpdateCentreAddOrUpdateLocationRequest({
        centre,
        location: centre.locations[0]
      });

      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const spy = jest.spyOn(router, 'navigate');

      mockActivatedRouteSnapshot('add', centre);
      store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
      fixture.detectChanges();

      component.onSubmit(centre.locations[0]);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      expect(component.isSaving$).toBeObservable(cold('b', { b: true }));

      ngZone.run(() => store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre })));

      fixture.whenStable().then(() => {
        expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
        expect(store.dispatch).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(['..']);
      });
    }));

    it('on submission failure', async(() => {
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

        store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
        fixture.detectChanges();

        errors.forEach(error => {
          component.onSubmit(centre.locations[0]);
          expect(component.savedMessage).toBe(testInfo.savedMessage);
          expect(component.isSaving$).toBeObservable(cold('b', { b: true }));
          store.dispatch(new CentreStoreActions.GetCentreFailure({ error }));

          fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
            expect(toastr.error).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
          });
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
