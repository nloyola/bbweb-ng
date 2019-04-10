import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ShipmentService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { Factory } from '@test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { ShipmentStoreEffects } from './shipment.effects';
import { Shipment } from '@app/domain/shipments';
import { Action } from '@ngrx/store';
import * as ShipmentActions from './shipment.actions';

describe('shipment-store effects', () => {

  let effects: ShipmentStoreEffects;
  let actions: Observable<any>;
  let shipmentService: ShipmentService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ShipmentStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(ShipmentStoreEffects);
    shipmentService = TestBed.get(ShipmentService);
    factory = new Factory();
  });

  describe('searchShipmentsRequestEffect', () => {

    it('should respond with success', () => {
      const searchParams = new SearchParams();
      const shipment = factory.shipment();
      const pagedReply = factory.pagedReply([ shipment ]);
      const action = ShipmentActions.searchShipmentsRequest({ searchParams });
      const completion = ShipmentActions.searchShipmentsSuccess({ pagedReply });
      spyOn(shipmentService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const searchParams = new SearchParams();
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
      const shipment = factory.shipment();
      const action = ShipmentActions.addShipmentRequest({ shipment });
      const completion = ShipmentActions.addShipmentSuccess({ shipment });
      spyOn(shipmentService, 'add').and.returnValue(of(shipment));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const shipment = factory.shipment();
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
      const shipment = factory.shipment();
      const action = ShipmentActions.getShipmentRequest({ slug: shipment.slug });
      const completion = ShipmentActions.getShipmentSuccess({ shipment });
      spyOn(shipmentService, 'get').and.returnValue(of(shipment));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const shipment = factory.shipment();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentActions.getShipmentRequest({ slug: shipment.slug });
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
      shipment = factory.shipment();
      action = ShipmentActions.updateShipmentRequest({
        request: {
          shipment,
          attributeName: 'courierName',
          value: factory.stringNext()
        }
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

});
