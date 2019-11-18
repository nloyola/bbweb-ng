import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchFilter, StateFilter } from '@app/domain/search-filters';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentSpecimenStoreReducer,
  ShipmentStoreActions,
  ShipmentStoreReducer,
  ShipmentSpecimenStoreActions
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { TestUtils } from '@test/utils';
import {
  ShipmentSpecimenAction,
  ShipmentSpecimensTableContainerComponent
} from './shipment-specimens-table.container';

describe('ShipmentSpecimensTableComponent', () => {
  let component: ShipmentSpecimensTableContainerComponent;
  let fixture: ComponentFixture<ShipmentSpecimensTableContainerComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(
          {
            shipment: ShipmentStoreReducer.reducer,
            'shipment-specimen': ShipmentSpecimenStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [ShipmentSpecimensTableContainerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentSpecimensTableContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    configureComponent(shipment);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('base filter is used to search for specimens', () => {
    const specimenFilter = new StateFilter(Object.values(ShipmentItemState), ShipmentItemState.Extra, false);
    configureComponent(shipment, specimenFilter);
    const dispatchListener = TestUtils.storeDispatchListener();
    fixture.detectChanges();
    expect(dispatchListener.mock.calls.length).toBe(1);
    expect(dispatchListener.mock.calls[0][0]).toEqual(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams: {
          filter: specimenFilter.getValue(),
          sort: 'inventoryId',
          page: 1
        }
      })
    );
  });

  it('specimens are sorted', () => {
    configureComponent(shipment);
    fixture.detectChanges();

    const dispatchListener = TestUtils.storeDispatchListener();
    component.specimensTableSortBy('inventoryId');
    fixture.detectChanges();

    expect(dispatchListener.mock.calls.length).toBe(1);
    expect(dispatchListener.mock.calls[0][0]).toEqual(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams: {
          filter: '',
          sort: 'inventoryId',
          page: 1
        }
      })
    );
  });

  it('a new page is loaded', () => {
    configureComponent(shipment);
    fixture.detectChanges();

    const newPage = 2;
    const dispatchListener = TestUtils.storeDispatchListener();
    component.specimensTablePageChanged(newPage);
    fixture.detectChanges();

    expect(dispatchListener.mock.calls.length).toBe(1);
    expect(dispatchListener.mock.calls[0][0]).toEqual(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams: {
          filter: '',
          sort: 'inventoryId',
          page: newPage
        }
      })
    );
  });

  it('viewing a specimen opens a modal', () => {
    configureComponent(shipment);
    fixture.detectChanges();

    const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    const modalListener = TestUtils.modalOpenListener();
    component.shipmentSpecimenAction([shipmentSpecimen, 'view']);
    expect(modalListener.mock.calls.length).toBe(1);
  });

  it('invoking an action emits an event', () => {
    configureComponent(shipment);
    fixture.detectChanges();

    const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    let eventProduced = false;
    component.onAction.subscribe(() => {
      eventProduced = true;
    });
    component.shipmentSpecimenAction([shipmentSpecimen, 'myaction']);
    expect(eventProduced).toBe(true);
  });

  function configureComponent(
    shipment: Shipment,
    baseFilter: SearchFilter = undefined,
    actions: ShipmentSpecimenAction[] = []
  ): void {
    component.shipment = shipment;
    component.baseFilter = baseFilter;
    component.actions = actions;
    store.dispatch(ShipmentStoreActions.getShipmentSuccess({ shipment }));
  }
});
