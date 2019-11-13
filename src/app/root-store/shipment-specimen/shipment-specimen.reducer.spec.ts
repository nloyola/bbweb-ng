import { PagedReplyEntityIds } from '@app/domain';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { Factory } from '@test/factory';
import * as ShipmentSpecimenActions from './shipment-specimen.actions';
import { initialState, reducer } from './shipment-specimen.reducer';

describe('ShipmentSpecimen Reducer', () => {
  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for shipment specimens', () => {
    it('SearchShipmentSpecimensRequest', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const searchParams = {};
      const action = ShipmentSpecimenActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams
      });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: searchParams,
        searchActive: true
      });
    });

    it('SearchShipmentSpecimensSuccess', () => {
      const shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      const pagedReply = factory.pagedReply<ShipmentSpecimen>([shipmentSpecimen]);
      const action = ShipmentSpecimenActions.searchShipmentSpecimensSuccess({ pagedReply });
      const state = reducer(
        {
          ...initialState,
          lastSearch: pagedReply.searchParams
        },
        action
      );

      const searchReply: { [key: string]: PagedReplyEntityIds } = {};
      searchReply[JSON.stringify(pagedReply.searchParams)] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };

      expect(state.searchReplies).toEqual(searchReply);
      expect(state.searchActive).toBe(false);
      expect(state.ids).toContain(shipmentSpecimen.id);
      expect(state.entities[shipmentSpecimen.id]).toEqual(shipmentSpecimen);
    });

    it('SearchShipmentSpecimensFailure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ShipmentSpecimenActions.searchShipmentSpecimensFailure({ error });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('when getting a shipment specimen', () => {
    let shipmentSpecimen: ShipmentSpecimen;

    beforeEach(() => {
      shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    });

    it('GetShipmentSpecimenRequest', () => {
      const action = ShipmentSpecimenActions.getShipmentSpecimenRequest({ id: shipmentSpecimen.id });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('GetShipmentSpecimenSuccess', () => {
      const action = ShipmentSpecimenActions.getShipmentSpecimenSuccess({ shipmentSpecimen });
      const state = reducer(undefined, action);

      expect(state.ids).toContain(shipmentSpecimen.id);
      expect(state.entities[shipmentSpecimen.id]).toEqual(shipmentSpecimen);
    });

    it('GetShipmentSpecimenFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ShipmentSpecimenActions.getShipmentSpecimenFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });
});
