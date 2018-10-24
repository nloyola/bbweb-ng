import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { EventTypeActions, ActionTypes } from './event-type.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { CollectionEventType } from '@app/domain/studies';

export interface State extends EntityState<CollectionEventType> {
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  lastAddedId: string;
  selectedEventTypeId: string;
  error?: any;
}

export const adapter: EntityAdapter<CollectionEventType> =
  createEntityAdapter<CollectionEventType>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  lastAddedId: null,
  selectedEventTypeId: null,
  error: null,
});

export function reducer(
  state = initialState,
  action: EventTypeActions
): State {
  switch (action.type) {

    case ActionTypes.SearchEventTypesRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case ActionTypes.SearchEventTypesFailure: {
      return {
        ...state,
        error: action.payload.error,
        lastSearch: null,
        searchActive: false
      };
    }

    case ActionTypes.SearchEventTypesSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(et => et.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
      };

      return adapter.addMany(pagedReply.entities, {
        ...state,
        searchReplies: {
          ...state.searchReplies,
          ...newReply
        },
        searchActive: false
      });
    }

    case ActionTypes.GetEventTypeSuccess: {
      return adapter.addOne(action.payload.eventType, state);
    }

    case ActionTypes.GetEventTypeFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.AddEventTypeRequest: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ActionTypes.AddEventTypeSuccess: {
      return adapter.addOne(action.payload.eventType, {
        ...state,
        lastAddedId: action.payload.eventType.id
      });
    }

    case ActionTypes.AddEventTypeFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.UpdateEventTypeSuccess: {
      return adapter.updateOne(
        {
          id: action.payload.eventType.id,
          changes: action.payload.eventType
        },
        state);
    }

    case ActionTypes.UpdateEventTypeFailure: {
      return {
        ...state,
        error: action
      };
    }

    case ActionTypes.RemoveEventTypeSuccess: {
      const selectedEventTypeId = (state.selectedEventTypeId !== action.payload.eventTypeId)
        ? state.selectedEventTypeId : null;
      return adapter.removeOne(action.payload.eventTypeId, {
        ...state,
        selectedEventTypeId
      });
    }

    case ActionTypes.RemoveEventTypeFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.EventTypeSelected: {
      return {
        ...state,
        selectedEventTypeId: action.payload.id
      };
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
