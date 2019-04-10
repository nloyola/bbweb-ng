import { reducer, initialState } from './shipment.reducer';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import * as ShipmentActions from './shipment.actions';
import { Shipment } from '@app/domain/shipments';

describe('Shipment Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for shipments', () => {

    it('SearchShipmentsRequest', () => {
      const searchParams = new SearchParams();
      const action = ShipmentActions.searchShipmentsRequest({ searchParams });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: searchParams,
        searchActive: true
      });
    });

    it('SearchShipmentsSuccess', () => {
      const shipment = new Shipment().deserialize(factory.shipment());
      const pagedReply = factory.pagedReply<Shipment>([ shipment ]);
      const action = ShipmentActions.searchShipmentsSuccess({ pagedReply });
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
      expect(state.ids).toContain(shipment.id);
      expect(state.entities[shipment.id]).toEqual(shipment);
    });

    it('SearchShipmentsFailure', () => {
      const error = {
        status: 404,
          error: {
            message: 'simulated error'
          }
      };
      const action = ShipmentActions.searchShipmentsFailure({ error });
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

  describe('when adding a shipment', () => {

    let shipment: Shipment;

    beforeEach(() => {
      shipment = new Shipment().deserialize(factory.shipment());
    });

    it('AddShipmentRequest', () => {
      const action = ShipmentActions.addShipmentRequest({ shipment });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('AddShipmentSuccess', () => {
      const action = ShipmentActions.addShipmentSuccess({ shipment });
      const state = reducer(undefined, action);

      expect(state.lastAddedId).toEqual(shipment.id);
      expect(state.ids).toContain(shipment.id);
      expect(state.entities[shipment.id]).toEqual(shipment);
    });

    it('AddShipmentFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ShipmentActions.addShipmentFailure(payload);
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

  describe('when getting a shipment', () => {

    let shipment: Shipment;

    beforeEach(() => {
      shipment = new Shipment().deserialize(factory.shipment());
    });

    it('GetShipmentRequest', () => {
      const action = ShipmentActions.getShipmentRequest({ id: shipment.id });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('GetShipmentSuccess', () => {
      const action = ShipmentActions.getShipmentSuccess({ shipment });
      const state = reducer(undefined, action);

      expect(state.ids).toContain(shipment.id);
      expect(state.entities[shipment.id]).toEqual(shipment);
    });

    it('GetShipmentFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ShipmentActions.getShipmentFailure(payload);
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

  describe('for updating a shipment', () => {

    let shipment: Shipment;
    let testInitialState: any;

    beforeEach(() => {
      shipment = factory.shipment();
      testInitialState = {
        ...initialState,
        ids: [ shipment.id ],
        entities: {}
      };
      testInitialState['entities'][shipment.id] = {};
    });

    it('UpdateShipmentSuccess', () => {
      const initialAction = ShipmentActions.getShipmentSuccess({ shipment });
      let state = reducer(initialState, initialAction);

      const  updatedShipment = new Shipment().deserialize({
        ...shipment as any,
        timePacked: new Date()
      });
      state = reducer(
        state,
        ShipmentActions.updateShipmentSuccess({ shipment: updatedShipment }));

      expect(state.ids).toContain(shipment.id);
      expect(state.entities[shipment.id]).toEqual(updatedShipment);
    });

    it('UpdateShipmentFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ShipmentActions.updateShipmentFailure(payload);
      const state = reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });
});
