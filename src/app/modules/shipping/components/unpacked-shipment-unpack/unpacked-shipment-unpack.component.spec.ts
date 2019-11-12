import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  ShipmentStoreReducer,
  ShipmentStoreActions,
  RootStoreState
} from '@app/root-store';
import { StoreModule, Store } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule } from 'ngx-toastr';
import { UnpackedShipmentUnpackComponent } from './unpacked-shipment-unpack.component';
import { TestUtils } from '@test/utils';
import { Specimen } from '@app/domain/participants';

describe('UnpackedShipmentUnpackComponent', () => {
  let component: UnpackedShipmentUnpackComponent;
  let fixture: ComponentFixture<UnpackedShipmentUnpackComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [UnpackedShipmentUnpackComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(UnpackedShipmentUnpackComponent);
    component = fixture.componentInstance;
    updateActivatedRoute(shipment);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  const errors = [
    'invalid inventory Ids',
    'specimens not in this shipment',
    'shipment specimens not present',
    'specimen inventory IDs already in this shipment',
    'specimens are already in an active shipment',
    'simulated error'
  ].map(errMessage => [errMessage, { error: { message: `:${errMessage}:` } }]);

  describe('when receiving a specimens', () => {
    let specimenInventoryIds: string[];

    beforeEach(() => {
      specimenInventoryIds = [factory.stringNext()];
      fixture.detectChanges();
    });

    it('dispatches an action when user receives specimens', () => {
      const dispatchListener = TestUtils.storeDispatchListener();
      component.receiveShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds,
          specimenTag: ShipmentItemState.Received
        })
      );
    });

    it('informs the user the specimens have been received', () => {
      const notificationListener = TestUtils.toastrSuccessListener();
      component.receiveShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensSuccess({ shipment }));
      expect(notificationListener.mock.calls.length).toBe(1);
    });

    it.each(errors)('informs the user there was a "%s" error', (errMessage, error) => {
      const modalOpenListener = TestUtils.modalOpenListener();
      component.receiveShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensFailure({ error }));
      expect(modalOpenListener.mock.calls.length).toBe(1);
    });
  });

  describe('when tagging a specimen as missing', () => {
    let specimen: Specimen;
    let shipmenSpecimen: ShipmentSpecimen;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
      shipmenSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      fixture.detectChanges();
    });

    it('dispatches an action', () => {
      const dispatchListener = TestUtils.storeDispatchListener();
      component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsMissing']);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds: [specimen.inventoryId],
          specimenTag: ShipmentItemState.Missing
        })
      );
    });

    it('informs the user the specimens have been received', () => {
      const notificationListener = TestUtils.toastrSuccessListener();
      component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsMissing']);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensSuccess({ shipment }));
      expect(notificationListener.mock.calls.length).toBe(1);
    });

    it.each(errors)('informs the user there was a "%s" error', (errMessage, error) => {
      const modalOpenListener = TestUtils.modalOpenListener();
      component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsMissing']);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensFailure({ error }));
      expect(modalOpenListener.mock.calls.length).toBe(1);
    });
  });

  it('throws an error if an invalid action is reported', () => {
    const invalidAction = factory.stringNext();
    const shipmenSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    fixture.detectChanges();
    expect(() => {
      component.shipmentSpecimenAction([shipmenSpecimen, invalidAction]);
    }).toThrowError(`action ${invalidAction} is not handled`);
  });

  function updateActivatedRoute(s: Shipment): void {
    TestBed.get(ActivatedRoute).parent = { snapshot: { data: { shipment: s } } };
  }
});
