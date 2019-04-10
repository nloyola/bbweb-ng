import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Shipment } from '@app/domain/shipments';
import * as ShipmentActions from './shipment.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';

export interface State extends EntityState<Shipment> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  error?: any;
}

export const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  error: null,
});

export function reducer(
  state = initialState,
  action: ShipmentActions.ShipmentActionsUnion
): State {
  switch (action.type) {
    case ShipmentActions.searchShipmentsRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case ShipmentActions.searchShipmentsSuccess.type: {
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds:    action.pagedReply.entities.map(shipment => shipment.id),
        searchParams: action.pagedReply.searchParams,
        offset:       action.pagedReply.offset,
        total:        action.pagedReply.total,
        maxPages:     action.pagedReply.maxPages
      };

      return adapter.upsertMany(action.pagedReply.entities, {
        ...state,
        searchReplies: {
          ...state.searchReplies,
          ...newReply
        },
        searchActive: false
      });
    }

    case ShipmentActions.searchShipmentsFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.addShipmentRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ShipmentActions.addShipmentSuccess.type: {
      return adapter.addOne(action.shipment, {
        ...state,
        lastAddedId: action.shipment.id
      });
    }

    case ShipmentActions.addShipmentFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.getShipmentRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ShipmentActions.getShipmentSuccess.type: {
      return adapter.upsertOne(action.shipment, state);
    }

    case ShipmentActions.getShipmentFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.updateShipmentRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ShipmentActions.updateShipmentSuccess.type: {
      return adapter.updateOne(
        {
          id: action.shipment.id,
          changes: action.shipment
        },
        state);
    }

    case ShipmentActions.updateShipmentFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

  }
  return state;
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
