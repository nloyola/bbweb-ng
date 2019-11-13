import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ShipmentSpecimenService } from '@app/core/services';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as ShipmentSpecimenActions from './shipment-specimen.actions';
import { ShipmentSpecimenStoreEffects } from './shipment-specimen.effects';

describe('shipmentSpecimen-store effects', () => {
  let effects: ShipmentSpecimenStoreEffects;
  let actions: Observable<any>;
  let shipmentSpecimenService: ShipmentSpecimenService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShipmentSpecimenStoreEffects, provideMockActions(() => actions)]
    });

    effects = TestBed.get(ShipmentSpecimenStoreEffects);
    shipmentSpecimenService = TestBed.get(ShipmentSpecimenService);
    factory = new Factory();
  });

  describe('searchShipmentSpecimensRequestEffect', () => {
    it('should respond with success', () => {
      const searchParams = {};
      const shipment = new Shipment().deserialize(factory.shipment());
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      const pagedReply = factory.pagedReply([shipmentSpecimen]);
      const action = ShipmentSpecimenActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams
      });
      const completion = ShipmentSpecimenActions.searchShipmentSpecimensSuccess({ pagedReply });
      spyOn(shipmentSpecimenService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = {};
      const shipment = new Shipment().deserialize(factory.shipment());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentSpecimenActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams
      });
      const completion = ShipmentSpecimenActions.searchShipmentSpecimensFailure({ error });
      spyOn(shipmentSpecimenService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('getShipmentSpecimenRequestEffect', () => {
    it('should respond with success', () => {
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      const action = ShipmentSpecimenActions.getShipmentSpecimenRequest({ id: shipmentSpecimen.id });
      const completion = ShipmentSpecimenActions.getShipmentSpecimenSuccess({ shipmentSpecimen });
      spyOn(shipmentSpecimenService, 'get').and.returnValue(of(shipmentSpecimen));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const shipmentSpecimen = factory.shipmentSpecimen();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentSpecimenActions.getShipmentSpecimenRequest({ id: shipmentSpecimen.id });
      const completion = ShipmentSpecimenActions.getShipmentSpecimenFailure({ error });
      spyOn(shipmentSpecimenService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });
});
