import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { ShipmentSpecimen, Shipment } from '@app/domain/shipments';
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
      const searchParams = new SearchParams();
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
      const pagedReply = factory.pagedReply<ShipmentSpecimen>([ shipmentSpecimen ]);
      const action = ShipmentSpecimenActions.searchShipmentSpecimensSuccess({ pagedReply });
      const state = reducer(
        {
          ...initialState,
          lastSearch: pagedReply.searchParams
        },
        action);

      const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
      searchReply[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset:       pagedReply.offset,
        total:        pagedReply.total,
        entityIds:    pagedReply.entities.map(e => e.id),
        maxPages:     pagedReply.maxPages
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

  describe('when removing a shipment specimen', () => {

    let shipmentSpecimen: ShipmentSpecimen;

    beforeEach(() => {
      shipmentSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
    });

    it('removeShipmentSpecimenRequest', () => {
      const action = ShipmentSpecimenActions.removeShipmentSpecimenRequest({ shipmentSpecimen });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('removeShipmentSpecimenSuccess', () => {
      const testInitialState = {
        ...initialState,
        ids: [ shipmentSpecimen.id ],
        entities: {}
      };
      testInitialState['entities'][shipmentSpecimen.id] = shipmentSpecimen;

      const action = ShipmentSpecimenActions.removeShipmentSpecimenSuccess({
        shipmentSpecimenId: shipmentSpecimen.id
      });
      const state = reducer(testInitialState, action);

      expect(state.ids).not.toContain(shipmentSpecimen.id);
      expect(state.entities[shipmentSpecimen.id]).toBeUndefined();
      expect(state.lastRemovedId).toBe(shipmentSpecimen.id);
    });

    it('removeShipmentSpecimenFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ShipmentSpecimenActions.removeShipmentSpecimenFailure(payload);
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
