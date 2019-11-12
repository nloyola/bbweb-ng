import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
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
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { TestUtils } from '@test/utils';
import { cold } from 'jasmine-marbles';
import { ToastrModule } from 'ngx-toastr';
import {
  CentreShipmentsDetailsComponent,
  CentreShipmentsViewMode
} from './centre-shipments-details.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
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
  });

  const modeTable = [
    [CentreShipmentsViewMode.Incoming, 'state:out:completed;destination::', 'origin'],
    [CentreShipmentsViewMode.Outgoing, 'state:out:completed;origin::', 'destination'],
    [CentreShipmentsViewMode.Completed, `state::${ShipmentState.Completed};destination::`, 'origin']
  ];

  describe.each(modeTable)("for centre's %s shipments", (mode, filterPrefix, locationSort) => {
    it('should create', () => {
      mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
      fixture.detectChanges();
      expect(component).toBeTruthy();
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
          searchParams: createSearchParams('')
        };
        mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
        fixture.detectChanges();

        const action = ShipmentStoreActions.searchShipmentsSuccess({ pagedReply });
        store.dispatch(action);
        fixture.detectChanges();
      });

      it('extracts shipments for the last search', () => {
        expect(component.shipments$).toBeObservable(cold('(ab)', { a: [], b: [shipment] }));
      });

      it('extracts the the maximun pages for the last search', () => {
        expect(component.maxPages$).toBeObservable(cold('(ab)', { a: 0, b: 1 }));
      });

      it('extracts the the total shipments for the last search', () => {
        expect(component.totalShipments$).toBeObservable(cold('(ab)', { a: 0, b: 1 }));
      });
    });

    const filterTable = [
      ['courierName', 'filterByCourierName'],
      ['trackingNumber', 'filterByTrackingNumber']
    ];

    describe.each(filterTable)('when requestinng filtering by %s', (filterName, filterMethod) => {
      it('action is dispatched', () => {
        mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
        fixture.detectChanges();

        const dispatchListener = jest.spyOn(store, 'dispatch');
        const value = factory.stringNext();
        expect(component[filterMethod]).toBeFunction();
        component[filterMethod](value);
        fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: createSearchParams(`${filterName}:like:${value}`)
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });

    describe('action is dispatched when filtering by state', () => {
      it.each`
        state                     | stateFilter
        ${undefined}              | ${''}
        ${ShipmentState.Created}  | ${`state::${ShipmentState.Created}`}
        ${ShipmentState.Packed}   | ${`state::${ShipmentState.Packed}`}
        ${ShipmentState.Sent}     | ${`state::${ShipmentState.Sent}`}
        ${ShipmentState.Received} | ${`state::${ShipmentState.Received}`}
        ${ShipmentState.Unpacked} | ${`state::${ShipmentState.Unpacked}`}
        ${ShipmentState.Lost}     | ${`state::${ShipmentState.Lost}`}
      `(`should filter by $state state`, ({ state, stateFilter }) => {
        mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
        fixture.detectChanges();

        const dispatchListener = jest.spyOn(store, 'dispatch');
        component.filterByState(state);
        fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: createSearchParams(stateFilter)
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });

    it('action is dispatched when a page is selected', () => {
      mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
      fixture.detectChanges();

      const pageNumber = 2;
      const dispatchListener = jest.spyOn(store, 'dispatch');
      component.paginationPageChange(pageNumber);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
        searchParams: {
          ...createSearchParams(),
          page: pageNumber
        }
      });
      expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
    });

    it('navigates to new state when user wants to view a shipment', () => {
      const navigateListener = TestUtils.routerNavigateListener();
      fixture.detectChanges();

      const shipment = new Shipment().deserialize(factory.shipment());
      component.shipmentView(shipment);
      fixture.detectChanges();

      expect(navigateListener.mock.calls.length).toBe(1);
      expect(navigateListener.mock.calls[0][0]).toEqual(['../view', shipment.id]);
    });

    const sortTable = [
      ['courierName', 'courierName'],
      ['trackingNumber', 'trackingNumber'],
      ['location', undefined], // use locationSort
      ['state', 'state']
    ];

    describe.each(sortTable)('when sorting by %s', (term, searchSortParam) => {
      let dispatchListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        mockActivatedRouteConfigure(centre, mode as CentreShipmentsViewMode);
        fixture.detectChanges();
        dispatchListener = jest.spyOn(store, 'dispatch');
      });

      it('requests sorting in ascending order', () => {
        component.sortBy(term);
        fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: {
            ...createSearchParams(),
            sort: searchSortParam ? searchSortParam : locationSort
          }
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });

      it('requesst sorting in descending order', () => {
        component.sortBy(`-${term}`);
        fixture.detectChanges();

        expect(dispatchListener.mock.calls.length).toBe(1);
        const expectedAction = ShipmentStoreActions.searchShipmentsRequest({
          searchParams: {
            ...createSearchParams(),
            sort: searchSortParam ? `-${searchSortParam}` : `-${locationSort}`
          }
        });
        expect(dispatchListener.mock.calls[0][0]).toEqual(expectedAction);
      });
    });

    function createSearchParams(additionalFilter: string = ''): SearchParams {
      let filters = `${filterPrefix}${centre.slug}`;
      if (additionalFilter.length > 0) {
        filters += `;${additionalFilter}`;
      }
      return {
        filter: filters,
        sort: '',
        page: 1
      };
    }
  });

  describe('when removing a shipment', () => {
    describe.each`
      mode
      ${CentreShipmentsViewMode.Incoming}
      ${CentreShipmentsViewMode.Outgoing}
    `('when mode is $mode', ({ mode }) => {
      let modalListener: jest.MockInstance<void, any[]>;
      let dispatchListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        mockActivatedRouteConfigure(centre, mode);
        fixture.detectChanges();

        const modalService = TestBed.get(NgbModal);
        modalListener = jest.spyOn(modalService, 'open').mockReturnValue({
          result: Promise.resolve('OK')
        });
        dispatchListener = jest.spyOn(store, 'dispatch');
      });

      it('dispatches the remove action', fakeAsync(() => {
        const shipment = new Shipment().deserialize(factory.shipment());
        component.shipmentRemove(shipment);
        flush();
        fixture.detectChanges();

        expect(modalListener.mock.calls.length).toBe(1);
        expect(dispatchListener.mock.calls.length).toBe(1);
        expect(dispatchListener.mock.calls[0][0]).toEqual(
          ShipmentStoreActions.removeShipmentRequest({ shipment })
        );
      }));

      it('infoms the user if the shipment was removed', fakeAsync(() => {
        const shipment = new Shipment().deserialize(factory.shipment());
        const toastrListener = TestUtils.toastrSuccessListener();

        component.shipmentRemove(shipment);
        flush();
        fixture.detectChanges();

        store.dispatch(
          ShipmentStoreActions.removeShipmentSuccess({
            shipmentId: shipment.id
          })
        );
        flush();
        fixture.detectChanges();

        expect(toastrListener.mock.calls.length).toBe(1);
      }));

      it('infoms the user if there was an error when removing', fakeAsync(() => {
        const shipment = new Shipment().deserialize(factory.shipment());
        const toastrListener = TestUtils.toastrErrorListener();

        component.shipmentRemove(shipment);
        flush();
        fixture.detectChanges();

        store.dispatch(
          ShipmentStoreActions.removeShipmentFailure({
            error: {
              error: {
                message: 'simulated error'
              }
            }
          })
        );
        flush();
        fixture.detectChanges();

        expect(toastrListener.mock.calls.length).toBe(1);
      }));

      it('throws an error if shipment is not in "created" state', fakeAsync(() => {
        const shipment = new Shipment().deserialize(
          factory.shipment({
            state: ShipmentState.Packed
          })
        );
        expect(() => {
          component.shipmentRemove(shipment);
        }).toThrowError(/should never be called for a shipment not in CREATED state/);
      }));

      it('opens a modal informing the user if the shipment contains specimens', fakeAsync(() => {
        const shipment = new Shipment().deserialize(factory.shipment({ specimenCount: 1 }));
        component.shipmentRemove(shipment);
        flush();
        fixture.detectChanges();

        expect(modalListener.mock.calls.length).toBe(1);
        expect(modalListener.mock.calls[0][0]).toBe(ModalShipmentHasSpecimensComponent);
        expect(dispatchListener.mock.calls.length).toBe(0);
      }));
    });
  });

  it('when removing a shipment, and mode is "completed", an exception is thrown', fakeAsync(() => {
    mockActivatedRouteConfigure(centre, CentreShipmentsViewMode.Completed);
    fixture.detectChanges();

    const shipment = new Shipment().deserialize(factory.shipment());
    expect(() => {
      component.shipmentRemove(shipment);
    }).toThrowError(/should never be called when viewing completed shipments/);
  }));
});

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
