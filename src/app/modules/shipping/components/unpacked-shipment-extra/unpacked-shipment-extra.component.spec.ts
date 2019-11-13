import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreReducer
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { UnpackShipmentSpecimenBehaviour } from '@test/behaviours/unpack-shipment-specimen.behaviour';
import { Factory } from '@test/factory';
import { ShipmentSpecimensFixture } from '@test/fixtures/shipment-specimens.fixture';
import { TestUtils } from '@test/utils';
import { ToastrModule } from 'ngx-toastr';
import { UnpackedShipmentExtraComponent } from './unpacked-shipment-extra.component';

describe('UnpackedShipmentExtraComponent', () => {
  let component: UnpackedShipmentExtraComponent;
  let fixture: ComponentFixture<UnpackedShipmentExtraComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
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
          useValue: {}
        }
      ],
      declarations: [UnpackedShipmentExtraComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(UnpackedShipmentExtraComponent);
    component = fixture.componentInstance;
    updateActivatedRoute(shipment);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when adding extra specimens', () => {
    let specimenInventoryIds: string[];

    beforeEach(() => {
      specimenInventoryIds = [factory.stringNext()];
      fixture.detectChanges();
    });

    it('dispatches an action when user receives specimens', () => {
      const dispatchListener = TestUtils.storeDispatchListener();
      component.tagShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds,
          specimenTag: ShipmentItemState.Extra
        })
      );
    });

    it('informs the user the specimens have been received', () => {
      const notificationListener = TestUtils.toastrSuccessListener();
      component.tagShipmentSpecimens(specimenInventoryIds);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensSuccess({ shipment }));
      expect(notificationListener.mock.calls.length).toBe(1);
    });

    it.each(ShipmentSpecimensFixture.errors)(
      'informs the user there was a "%s" error',
      (_errMessage, error) => {
        const modalOpenListener = TestUtils.modalOpenListener();
        component.tagShipmentSpecimens(specimenInventoryIds);
        fixture.detectChanges();

        store.dispatch(ShipmentStoreActions.tagSpecimensFailure({ error }));
        expect(modalOpenListener.mock.calls.length).toBe(1);
      }
    );
  });

  describe('when removing an extra specimen', () => {
    let shipmentSpecimen: ShipmentSpecimen;

    beforeEach(() => {
      shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      fixture.detectChanges();
    });

    it('dispatches an action', fakeAsync(() => {
      TestUtils.modalOpenListener();
      const dispatchListener = TestUtils.storeDispatchListener();
      component.shipmentSpecimenAction([shipmentSpecimen, 'remove']);
      flush();
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.removeSpecimenRequest({ shipment, shipmentSpecimen })
      );
    }));

    it('informs the user the specimens have been removed', fakeAsync(() => {
      TestUtils.modalOpenListener();
      const notificationListener = TestUtils.toastrSuccessListener();
      component.shipmentSpecimenAction([shipmentSpecimen, 'remove']);
      flush();
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.removeSpecimenSuccess({ shipment }));
      flush();
      fixture.detectChanges();
      expect(notificationListener.mock.calls.length).toBe(1);
    }));

    it.each(ShipmentSpecimensFixture.errors)(
      'informs the user there was a "%s" error',
      (_errMessage, error) => {
        const modalOpenListener = TestUtils.modalOpenListener();
        component.shipmentSpecimenAction([shipmentSpecimen, 'remove']);
        fixture.detectChanges();

        store.dispatch(ShipmentStoreActions.removeSpecimenFailure({ error }));
        expect(modalOpenListener.mock.calls.length).toBe(1);
      }
    );
  });

  describe('shared behavour', () => {
    let context: UnpackShipmentSpecimenBehaviour.Context<UnpackedShipmentExtraComponent> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.component = component;
    });

    UnpackShipmentSpecimenBehaviour.sharedBehaviour(context, factory);
  });

  function updateActivatedRoute(s: Shipment): void {
    TestBed.get(ActivatedRoute).parent = { snapshot: { data: { shipment: s } } };
  }
});
