import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ShipmentSpecimen } from '@app/domain/shipments';
import * as ShipmentSpecimenActions from './shipment-specimen.actions';
import { SearchParams, PagedReplyEntityIds, searchParams2Term } from '@app/domain';

export interface State extends EntityState<ShipmentSpecimen> {
  lastRemovedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [url: string]: PagedReplyEntityIds };
  error?: any;
}

export const adapter: EntityAdapter<ShipmentSpecimen> = createEntityAdapter<ShipmentSpecimen>();

export const initialState: State = adapter.getInitialState({
  lastRemovedId: null,
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  error: null
});

export function reducer(
  state = initialState,
  action: ShipmentSpecimenActions.ShipmentSpecimenActionsUnion
): State {
  switch (action.type) {
    case ShipmentSpecimenActions.searchShipmentSpecimensRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case ShipmentSpecimenActions.searchShipmentSpecimensSuccess.type: {
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

    case ShipmentSpecimenActions.searchShipmentSpecimensFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentSpecimenActions.getShipmentSpecimenRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ShipmentSpecimenActions.getShipmentSpecimenSuccess.type: {
      return adapter.upsertOne(action.shipmentSpecimen, state);
    }

    case ShipmentSpecimenActions.getShipmentSpecimenFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ShipmentSpecimenActions.removeShipmentSpecimenRequest.type: {
      return {
        ...state,
        lastRemovedId: null,
        error: null
      };
    }

    case ShipmentSpecimenActions.removeShipmentSpecimenSuccess.type: {
      return adapter.removeOne(action.shipmentSpecimenId, {
        ...state,
        lastRemovedId: action.shipmentSpecimenId
      });
    }

    case ShipmentSpecimenActions.removeShipmentSpecimenFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
