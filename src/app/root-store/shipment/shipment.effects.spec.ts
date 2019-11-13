import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ShipmentService } from '@app/core/services';
import { Specimen } from '@app/domain/participants';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, getTestScheduler, hot, initTestScheduler } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as ShipmentActions from './shipment.actions';
import { ShipmentStoreEffects } from './shipment.effects';

describe('shipment-store effects', () => {
  let effects: ShipmentStoreEffects;
  let actions: Observable<any>;
  let shipmentService: ShipmentService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShipmentStoreEffects, provideMockActions(() => actions)]
    });

    effects = TestBed.get(ShipmentStoreEffects);
    shipmentService = TestBed.get(ShipmentService);
    factory = new Factory();
  });

  describe('searchShipmentsRequestEffect', () => {
    it('should respond with success', () => {
      const searchParams = {};
      const shipment = new Shipment().deserialize(factory.shipment());
      const pagedReply = factory.pagedReply([shipment]);
      const action = ShipmentActions.searchShipmentsRequest({ searchParams });
      const completion = ShipmentActions.searchShipmentsSuccess({ pagedReply });
      spyOn(shipmentService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = {};
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentActions.searchShipmentsRequest({ searchParams });
      const completion = ShipmentActions.searchShipmentsFailure({ error });
      spyOn(shipmentService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addShipmentRequestEffect', () => {
    it('should respond with success', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const action = ShipmentActions.addShipmentRequest({ shipment });
      const completion = ShipmentActions.addShipmentSuccess({ shipment });
      spyOn(shipmentService, 'add').and.returnValue(of(shipment));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentActions.addShipmentRequest({ shipment });
      const completion = ShipmentActions.addShipmentFailure({ error });
      spyOn(shipmentService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getShipmentRequestEffect', () => {
    it('should respond with success', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const action = ShipmentActions.getShipmentRequest({ id: shipment.id });
      const completion = ShipmentActions.getShipmentSuccess({ shipment });
      spyOn(shipmentService, 'get').and.returnValue(of(shipment));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentActions.getShipmentRequest({ id: shipment.id });
      const completion = ShipmentActions.getShipmentFailure({ error });
      spyOn(shipmentService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {
    let shipment: Shipment;
    let action: Action;
    let shipmentListener: any;

    beforeEach(() => {
      shipment = new Shipment().deserialize(factory.shipment());
      action = ShipmentActions.updateShipmentRequest({
        shipment,
        attributeName: 'courierName',
        value: factory.stringNext()
      });
      shipmentListener = jest.spyOn(shipmentService, 'update');
    });

    it('should respond with success', () => {
      const completion = ShipmentActions.updateShipmentSuccess({ shipment });

      shipmentListener.mockReturnValue(of(shipment));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ShipmentActions.updateShipmentFailure({ error });

      shipmentListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('addSpecimensEffect', () => {
    let specimens: Specimen[];
    let shipment: Shipment;
    let action: Action;
    let shipmentListener: any;

    beforeEach(() => {
      specimens = [new Specimen().deserialize(factory.specimen())];
      shipment = new Shipment().deserialize(factory.shipment());
      action = ShipmentActions.addSpecimensRequest({
        shipment,
        specimenInventoryIds: specimens.map(s => s.inventoryId)
      });
      shipmentListener = jest.spyOn(shipmentService, 'addSpecimens');
    });

    it('should respond with success', () => {
      const completion = ShipmentActions.addSpecimensSuccess({ shipment });

      shipmentListener.mockReturnValue(of(shipment));
      actions = hot('--a-', { a: action });
      expect(effects.addSpecimensRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ShipmentActions.addSpecimensFailure({ error });

      shipmentListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.addSpecimensRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('canAddSpecimenEffect', () => {
    let specimen: Specimen;
    let action: Action;
    let shipmentListener: any;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
      action = ShipmentActions.canAddSpecimenRequest({ inventoryId: specimen.inventoryId });
      shipmentListener = jest.spyOn(shipmentService, 'canAddSpecimen');
    });

    it('should respond with success', () => {
      const completion = ShipmentActions.canAddSpecimenSuccess({ specimen });

      shipmentListener.mockReturnValue(of(specimen));
      actions = hot('--a-', { a: action });
      expect(effects.canAddSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ShipmentActions.canAddSpecimenFailure({ error });

      shipmentListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.canAddSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('tagSpecimensEffect', () => {
    let specimens: Specimen[];
    let shipment: Shipment;
    let action: Action;
    const tagData = {};

    beforeEach(() => {
      specimens = [new Specimen().deserialize(factory.specimen())];
      shipment = new Shipment().deserialize(factory.shipment());

      tagData[ShipmentItemState.Present] = {
        methodName: 'tagSpecimensAsPresent',
        listener: jest.spyOn(shipmentService, 'tagSpecimensAsPresent')
      };
      tagData[ShipmentItemState.Received] = {
        methodName: 'tagSpecimensAsReceived',
        listener: jest.spyOn(shipmentService, 'tagSpecimensAsReceived')
      };
      tagData[ShipmentItemState.Missing] = {
        methodName: 'tagSpecimensAsMissing',
        listener: jest.spyOn(shipmentService, 'tagSpecimensAsMissing')
      };
      tagData[ShipmentItemState.Extra] = {
        methodName: 'tagSpecimensAsExtra',
        listener: jest.spyOn(shipmentService, 'tagSpecimensAsExtra')
      };
    });

    it('should respond with success', () => {
      Object.keys(tagData).forEach(tag => {
        initTestScheduler();
        action = ShipmentActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds: specimens.map(s => s.inventoryId),
          specimenTag: tag as ShipmentItemState
        });

        tagData[tag].listener.mockReturnValue(of(shipment));
        actions = hot('--a-', { a: action });

        const completion = ShipmentActions.tagSpecimensSuccess({ shipment });
        expect(effects.tagSpecimensRequest$).toBeObservable(cold('--b', { b: completion }));
        getTestScheduler().flush();
      });
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      Object.keys(tagData).forEach(tag => {
        initTestScheduler();
        action = ShipmentActions.tagSpecimensRequest({
          shipment,
          specimenInventoryIds: specimens.map(s => s.inventoryId),
          specimenTag: tag as ShipmentItemState
        });
        const completion = ShipmentActions.tagSpecimensFailure({ error });

        tagData[tag].listener.mockReturnValue(throwError(error));
        actions = hot('--a-', { a: action });
        expect(effects.tagSpecimensRequest$).toBeObservable(cold('--b', { b: completion }));
        getTestScheduler().flush();
      });
    });
  });

  describe('removeSpecimenRequestEffect', () => {
    let shipment: Shipment;
    let shipmentSpecimen: ShipmentSpecimen;
    let action: Action;

    beforeEach(() => {
      shipment = new Shipment().deserialize(factory.shipment());
      shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      action = ShipmentActions.removeSpecimenRequest({ shipment, shipmentSpecimen });
    });

    it('should respond with success', () => {
      const completion = ShipmentActions.removeSpecimenSuccess({ shipment });

      jest.spyOn(shipmentService, 'removeSpecimen').mockReturnValue(of(shipment));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ShipmentActions.removeSpecimenFailure({ error });

      jest.spyOn(shipmentService, 'removeSpecimen').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeSpecimenRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeShipmentRequestEffect', () => {
    let shipment: Shipment;
    let action: Action;

    beforeEach(() => {
      shipment = new Shipment().deserialize(factory.shipment());
      action = ShipmentActions.removeShipmentRequest({ shipment });
    });

    it('should respond with success', () => {
      const completion = ShipmentActions.removeShipmentSuccess({ shipmentId: shipment.id });

      jest.spyOn(shipmentService, 'remove').mockReturnValue(of(shipment.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeShipmentRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ShipmentActions.removeShipmentFailure({ error });

      jest.spyOn(shipmentService, 'remove').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeShipmentRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });
});
