import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Shipment } from '@app/domain/shipments';
import * as ShipmentActions from './shipment.actions';
import { SearchParams, PagedReplyEntityIds, searchParams2Term } from '@app/domain';

export interface State extends EntityState<Shipment> {
  lastAddedId: string;
  lastRemovedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [url: string]: PagedReplyEntityIds };
  canAddSpecimenInventoryIds: string[];
  error?: any;
}

export const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastRemovedId: null,
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  canAddSpecimenInventoryIds: [],
  error: null
});

export function reducer(state = initialState, action: ShipmentActions.ShipmentActionsUnion): State {
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
      const searchTerm = searchParams2Term(state.lastSearch);
      const newReply = {};
      newReply[searchTerm] = {
        entityIds: action.pagedReply.entities.map(shipment => shipment.id),
        searchParams: action.pagedReply.searchParams,
        offset: action.pagedReply.offset,
        total: action.pagedReply.total,
        maxPages: action.pagedReply.maxPages
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
          changes: {
            timePacked: undefined,
            timeSent: undefined,
            timeReceived: undefined,
            timeUnpacked: undefined,
            timeCompleted: undefined,
            ...action.shipment
          }
        },
        state
      );
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

    case ShipmentActions.addSpecimensRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ShipmentActions.addSpecimensSuccess.type: {
      return adapter.upsertOne(action.shipment, state);
    }

    case ShipmentActions.addSpecimensFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.canAddSpecimenRequest.type: {
      return {
        ...state,
        canAddSpecimenInventoryIds: [
          ...state.canAddSpecimenInventoryIds.filter(id => id !== action.inventoryId)
        ],
        error: null
      };
    }

    case ShipmentActions.canAddSpecimenSuccess.type: {
      return {
        ...state,
        canAddSpecimenInventoryIds: [...state.canAddSpecimenInventoryIds, action.specimen.inventoryId]
      };
    }

    case ShipmentActions.canAddSpecimenFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.tagSpecimensRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ShipmentActions.tagSpecimensSuccess.type: {
      return adapter.upsertOne(action.shipment, state);
    }

    case ShipmentActions.tagSpecimensFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.removeShipmentRequest.type: {
      return {
        ...state,
        lastRemovedId: null,
        error: null
      };
    }

    case ShipmentActions.removeShipmentSuccess.type: {
      return adapter.removeOne(action.shipmentId, {
        ...state,
        lastRemovedId: action.shipmentId
      });
    }

    case ShipmentActions.removeShipmentFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentActions.clearLastAdded.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }
  }
  return state;
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
