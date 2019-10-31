import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre, CentreState } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { LocationRemoveComponent } from '@app/shared/components/location-remove/location-remove.component';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreLocationsComponent } from './centre-locations.component';

describe('CentreLocationsComponent', () => {
  let component: CentreLocationsComponent;
  let fixture: ComponentFixture<CentreLocationsComponent>;
  let ngZone: NgZone;
  let router: Router;
  let store: Store<RootStoreState.State>;
  let modalService: NgbModal;
  let toastr: ToastrService;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre({ locations: [factory.location()] }));

    TestBed.configureTestingModule({
      imports: [
        BrowserDynamicTestingModule,
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
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    centre: centre
                  },
                  params: {
                    slug: centre.slug
                  }
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [CentreLocationsComponent, LocationRemoveComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    // https://github.com/angular/angular/issues/12079
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [LocationRemoveComponent]
      }
    });
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
    store = TestBed.get(Store);
    modalService = TestBed.get(NgbModal);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(CentreLocationsComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should change state', () => {
    const spy = jest.spyOn(router, 'navigate');
    const location = centre.locations[0];

    const testData = [
      {
        componentFunc: c => c.addLocation(),
        relativePath: 'add'
      },
      {
        componentFunc: c => c.edit(location),
        relativePath: `${location.id}`
      }
    ];

    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    testData.forEach((testInfo, index) => {
      ngZone.run(() => testInfo.componentFunc(component));
      fixture.detectChanges();
      expect(spy.mock.calls[index][0]).toEqual([testInfo.relativePath]);
    });
  });

  it('should open a modal', () => {
    const spy = jest.spyOn(modalService, 'open');
    const location = centre.locations[0];

    const testData = [
      {
        componentFunc: component => component.remove(location)
      }
    ];

    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    testData.forEach((testInfo, index) => {
      testInfo.componentFunc(component);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should throw an error when centre is not disabled', () => {
    centre = new Centre().deserialize({
      ...(centre as any),
      state: CentreState.Enabled
    });
    jest.spyOn(modalService, 'open');
    const location = centre.locations[0];

    const testData = [
      { componentFunc: c => c.addLocation() },
      { componentFunc: c => c.edit(location) },
      { componentFunc: c => c.remove(location) }
    ];

    fixture.detectChanges();
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    testData.forEach(testInfo => {
      expect(() => testInfo.componentFunc(component)).toThrowError('modifications not allowed');
    });
  });

  describe('when removing a location', () => {
    it('on valid removal', fakeAsync(() => {
      const centreNoLocations = new Centre().deserialize({
        ...(centre as any),
        locations: []
      });
      const location = centre.locations[0];

      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      } as any);

      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();
      const storeListner = jest.spyOn(store, 'dispatch');
      component.remove(location);

      flush();
      const expectedAction = CentreStoreActions.updateCentreRequest({
        centre,
        attributeName: 'locationRemove',
        value: location
      });
      expect(storeListner.mock.calls.length).toBe(1);
      expect(storeListner.mock.calls[0][0]).toEqual(expectedAction);
      store.dispatch(CentreStoreActions.updateCentreSuccess({ centre: centreNoLocations }));

      flush();
      fixture.detectChanges();
      expect(toastr.success).toHaveBeenCalled();
    }));

    it('on submission failure', fakeAsync(() => {
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

      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      } as any);
      jest.spyOn(toastr, 'error').mockReturnValue(null);

      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      errors.forEach(error => {
        component.remove(centre.locations[0]);
        flush();
        fixture.detectChanges();
        store.dispatch(CentreStoreActions.updateCentreFailure({ error }));

        flush();
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    }));
  });
});
