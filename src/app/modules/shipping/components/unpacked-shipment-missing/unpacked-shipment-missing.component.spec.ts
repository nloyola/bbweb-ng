import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Specimen } from '@app/domain/participants';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import {
  NgrxRuntimeChecks,
  RootStoreState,
  ShipmentStoreActions,
  ShipmentStoreReducer
} from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ShipmentSpecimensFixture } from '@test/fixtures/shipment-specimens.fixture';
import { TestUtils } from '@test/utils';
import { ToastrModule } from 'ngx-toastr';
import { UnpackedShipmentMissingComponent } from './unpacked-shipment-missing.component';
import { UnpackShipmentSpecimenBehaviour } from '@test/behaviours/unpack-shipment-specimen.behaviour';

describe('UnpackedShipmentMissingComponent', () => {
  let component: UnpackedShipmentMissingComponent;
  let fixture: ComponentFixture<UnpackedShipmentMissingComponent>;
  const factory = new Factory();
  let shipment: Shipment;
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({ shipment: ShipmentStoreReducer.reducer }, NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [UnpackedShipmentMissingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(UnpackedShipmentMissingComponent);
    component = fixture.componentInstance;

    updateActivatedRoute(shipment);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when tagging a specimen as present', () => {
    let specimen: Specimen;
    let shipmenSpecimen: ShipmentSpecimen;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
      shipmenSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      fixture.detectChanges();
    });

    it('dispatches an action', () => {
      const dispatchListener = TestUtils.storeDispatchListener();
      component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsPresent']);
      fixture.detectChanges();

      expect(dispatchListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls[0][0]).toEqual(
        ShipmentStoreActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds: [specimen.inventoryId],
          specimenTag: ShipmentItemState.Present
        })
      );
    });

    it('informs the user the specimens have been received', () => {
      const notificationListener = TestUtils.notificationShowListener();
      component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsPresent']);
      fixture.detectChanges();

      store.dispatch(ShipmentStoreActions.tagSpecimensSuccess({ shipment }));
      expect(notificationListener.mock.calls.length).toBe(1);
    });

    it.each(ShipmentSpecimensFixture.errors)(
      'informs the user there was a "%s" error',
      (errMessage, error) => {
        const notificationListener = TestUtils.notificationShowErrorListener();
        component.shipmentSpecimenAction([shipmenSpecimen, 'tagAsPresent']);
        fixture.detectChanges();

        store.dispatch(ShipmentStoreActions.tagSpecimensFailure({ error }));
        expect(notificationListener.mock.calls.length).toBe(1);
      }
    );
  });

  describe('shared behavour', () => {
    let context: UnpackShipmentSpecimenBehaviour.Context<UnpackedShipmentMissingComponent> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.component = component;
    });

    UnpackShipmentSpecimenBehaviour.sharedBehaviour(context, factory);
  });

  function updateActivatedRoute(s: Shipment) {
    TestBed.get(ActivatedRoute).parent = { snapshot: { data: { shipment: s } } };
  }
});
