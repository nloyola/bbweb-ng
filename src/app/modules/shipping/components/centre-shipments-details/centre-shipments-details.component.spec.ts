import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PagedReply, SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { IShipment, Shipment, ShipmentState } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentSpecimenStoreReducer,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { TestUtils } from '@test/utils';
import { cold } from 'jasmine-marbles';
import { ToastrModule } from 'ngx-toastr';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import {
  CentreShipmentsDetailsComponent,
  CentreShipmentsViewMode
} from './centre-shipments-details.component';

interface ComponentBehavourContext {
  component?: CentreShipmentsDetailsComponent;
  fixture?: ComponentFixture<CentreShipmentsDetailsComponent>;
  store?: Store<RootStoreState.State>;
  centre?: Centre;
  filter?: string;
  locationSort?: string;
}

interface SortBehaviourContext {
  sortField?: string;
  searchParams?: SearchParams;
}

const mockActivatedRoute = new MockActivatedRoute();

describe('CentreShipmentsDetailsComponent', () => {
  let component: CentreShipmentsDetailsComponent;
  let fixture: ComponentFixture<CentreShipmentsDetailsComponent>;
  const factory = new Factory();
  let centre: Centre;
  let store: Store<RootStoreState.State>;
  let context: ComponentBehavourContext = {
    component,
    fixture,
    store,
    centre
  };

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer,
            'shipment-specimen': ShipmentSpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [CentreShipmentsDetailsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(CentreShipmentsDetailsComponent);
    component = fixture.componentInstance;

    context.component = component;
    context.fixture = fixture;
    context.store = store;
    context.centre = centre;
  });

  describe('for incoming shipments', () => {
    beforeEach(() => {
      mockActivatedRouteConfigure(centre, CentreShipmentsViewMode.Incoming);
      fixture.detectChanges();
      context.filter = `toCentre::${centre.slug}`;
      context.locationSort = 'fromLocationName';
    });

    componentSharedBehaviour(CentreShipmentsViewMode.Incoming, context);
  });

  describe('for outgoing shipments', () => {
    beforeEach(() => {
      mockActivatedRouteConfigure(centre, CentreShipmentsViewMode.Outgoing);
      fixture.detectChanges();
      context.filter = `fromCentre::${centre.slug}`;
      context.locationSort = 'toLocationName';
    });

    componentSharedBehaviour(CentreShipmentsViewMode.Outgoing, context);
  });

  describe('for completed shipments', () => {
    beforeEach(() => {
      mockActivatedRouteConfigure(centre, CentreShipmentsViewMode.Completed);
      fixture.detectChanges();
      context.filter = `toCentre::${centre.slug};state::${ShipmentState.Completed}`;
      context.locationSort = 'fromLocationName';
    });

    componentSharedBehaviour(CentreShipmentsViewMode.Completed, context);
  });
});

function componentSharedBehaviour(mode: CentreShipmentsViewMode, context: ComponentBehavourContext) {
  const factory = new Factory();

  describe('component (shared behavour)', () => {
    it('should create', () => {
      context.fixture.detectChanges();
      expect(context.component).toBeTruthy();
    });

    describe('extracts data from search replies', () => {
      let plainShipment: IShipment;
      let shipment: Shipment;
      let pagedReply: PagedReply<Shipment>;

      beforeEach(() => {
        plainShipment = factory.shipment();
        shipment = new Shipment().deserialize(plainShipment);
        const emptyPagedReply = factory.pagedReply([shipment]);
        pagedReply = {
          ...emptyPagedReply,
          searchParams: {
            ...emptyPagedReply.searchParams,
            filter: '',
            sort: undefined,
            page: 1,
            limit: 5
          }
        };
        mockActivatedRouteConfigure(context.centre, CentreShipmentsViewMode.Outgoing);
        context.fixture.detectChanges();

        const action = ShipmentStoreActions.searchShipmentsSuccess({ pagedReply });
        context.store.dispatch(action);
        context.fixture.detectChanges();
      });

      it('extracts shipments for the last search', () => {
        expect(context.component.shipments$).toBeObservable(cold('a', { a: [shipment] }));
      });

      it('extracts the the maximun pages for the last search', () => {
        expect(context.component.maxPages$).toBeObservable(cold('a', { a: 1 }));
      });

      it('extracts the the total shipments for the last search', () => {
        expect(context.component.totalShipments$).toBeObservable(cold('a', { a: 1 }));
      });
    });

    const filterTable = [['courierName', 'filterByCourierName']];

    describe.each(filterTable)('when requestinng filtering by $filter', (filterName, filterMethod) => {
      let dispatchListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        context.fixture.detectChanges();
        dispatchListener = jest.spyOn(context.store, 'dispatch');
      });

      it('action is dispatched when filtering by courier name', () => {
        const value = factory.stringNext();
        expect(context.component[filterMethod]).toBeFunction();
        context.component[filterMethod](value);
        context.fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const searchParams = {
          filter: `${context.filter};${filterName}:like:${value}`,
          sort: '',
          page: 1
        };
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({ searchParams });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });

    // describe('for filtering', () => {
    //   it('action is dispatched when filtering by tracking number', () => {
    //     const trackingNumber = factory.stringNext();
    //     context.component.filterByTrackingNumber(trackingNumber);
    //     context.fixture.detectChanges();

    //     expect(dispatchListener.mock.calls.length).toBe(1);
    //     const searchParams = {
    //       filter: `${context.filter};trackingNumber:like:${trackingNumber}`,
    //       sort: '',
    //       page: 1
    //     };
    //     const expectedAction = ShipmentStoreActions.searchShipmentsRequest({ searchParams });
    //     expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    //   });

    //   describe('action is dispatched when filtering by state', () => {
    //     test.each`
    //       state                     | stateFilter
    //       ${undefined}              | ${''}
    //       ${ShipmentState.Created}  | ${`;state::${ShipmentState.Created}`}
    //       ${ShipmentState.Packed}   | ${`;state::${ShipmentState.Packed}`}
    //       ${ShipmentState.Sent}     | ${`;state::${ShipmentState.Sent}`}
    //       ${ShipmentState.Received} | ${`;state::${ShipmentState.Received}`}
    //       ${ShipmentState.Unpacked} | ${`;state::${ShipmentState.Unpacked}`}
    //       ${ShipmentState.Lost}     | ${`;state::${ShipmentState.Lost}`}
    //     `(`should filter by $state state`, ({ state, stateFilter }) => {
    //       context.component.filterByState(state);
    //       context.fixture.detectChanges();

    //       expect(dispatchListener.mock.calls.length).toBe(1);
    //       const searchParams = {
    //         filter: `${context.filter}${stateFilter}`,
    //         sort: '',
    //         page: 1
    //       };
    //       const expectedAction = ShipmentStoreActions.searchShipmentsRequest({ searchParams });
    //       expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    //     });
    //   });
    // });

    it('action is dispatched when a page is selected', () => {
      const pageNumber = 2;
      const dispatchListener = jest.spyOn(context.store, 'dispatch');
      context.fixture.detectChanges();

      context.component.paginationPageChange(pageNumber);
      context.fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      const searchParams = {
        filter: context.filter,
        sort: '',
        page: pageNumber
      };
      const expectedAction = ShipmentStoreActions.searchShipmentsRequest({ searchParams });
      expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    });

    it('navigates to new state when user wants to view a shipment', () => {
      const navigateListener = TestUtils.routerNavigateListener();
      context.fixture.detectChanges();

      const shipment = new Shipment().deserialize(factory.shipment());
      context.component.shipmentView(shipment);
      context.fixture.detectChanges();

      expect(navigateListener.mock.calls.length).toBe(1);
      expect(navigateListener.mock.calls[0][0]).toEqual(['../view', shipment.id]);
    });

    describe('when removing a shipment', () => {
      it('dispatches the remove action', fakeAsync(() => {
        if (mode === CentreShipmentsViewMode.Completed) {
        } else {
          context.fixture.detectChanges();

          const shipment = new Shipment().deserialize(factory.shipment());
          const dispatchListener = jest.spyOn(context.store, 'dispatch');
          const modalService = TestBed.get(NgbModal);
          const modalListener = jest.spyOn(modalService, 'open').mockReturnValue({
            result: Promise.resolve('OK')
          });
          context.component.shipmentRemove(shipment);
          flush();
          context.fixture.detectChanges();

          expect(modalListener.mock.calls.length).toBe(1);
          expect(dispatchListener.mock.calls.length).toBe(1);
          expect(dispatchListener.mock.calls[0][0]).toEqual(
            ShipmentStoreActions.removeShipmentRequest({ shipment })
          );
        }
      }));
    });

    const sortTable = [
      ['courierName', 'courierName'],
      ['trackingNumber', 'trackingNumber'],
      ['location', undefined], // use context.locationSort
      ['state', 'state']
    ];

    describe.each(sortTable)('when sorting by %s', (term, searchSortParam) => {
      let dispatchListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        context.fixture.detectChanges();
        dispatchListener = jest.spyOn(context.store, 'dispatch');
      });

      it('requests sorting in ascending order', () => {
        context.component.sortBy(term);
        context.fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: {
            filter: context.filter,
            sort: searchSortParam ? searchSortParam : context.locationSort,
            page: 1
          }
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });

      it('requesst sorting in descending order', () => {
        context.component.sortBy(`-${term}`);
        context.fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: {
            filter: context.filter,
            sort: searchSortParam ? `-${searchSortParam}` : `-${context.locationSort}`,
            page: 1
          }
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });
  });

  function sortSharedBehaviour(sortContext: SortBehaviourContext) {
    describe('sort behaviour (shared)', () => {
      let dispatchListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        context.fixture.detectChanges();
        dispatchListener = jest.spyOn(context.store, 'dispatch');
      });

      it('the search request action is dispatched when sorting in ascending order', () => {
        context.component.sortBy(sortContext.sortField);
        context.fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: sortContext.searchParams
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });

      it('the search request action is dispatched when sorting in descending order', () => {
        context.component.sortBy(`-${sortContext.sortField}`);
        context.fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: {
            ...sortContext.searchParams,
            sort: `-${sortContext.searchParams.sort}`
          }
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });
  }
}

function mockActivatedRouteConfigure(centre: Centre, mode: CentreShipmentsViewMode): void {
  mockActivatedRoute.spyOnParent(() => ({
    parent: {
      snapshot: {
        data: {
          centre
        }
      }
    },
    snapshot: {
      data: { mode }
    }
  }));
}
