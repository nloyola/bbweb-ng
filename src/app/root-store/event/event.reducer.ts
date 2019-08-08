import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { CollectionEvent } from '@app/domain/participants';
import * as CollectionEventActions from './event.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';

export interface State extends EntityState<CollectionEvent> {
  lastAddedId: string;
  lastRemovedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [url: string]: PagedReplyEntityIds };
  error?: any;
}

export const adapter: EntityAdapter<CollectionEvent> = createEntityAdapter<CollectionEvent>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastRemovedId: null,
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  error: null
});

export function reducer(state = initialState, action: CollectionEventActions.EventActionsUnion): State {
  switch (action.type) {
    case CollectionEventActions.searchEventsRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case CollectionEventActions.searchEventsSuccess.type: {
      const searchTerm = JSON.stringify(state.lastSearch);
      const newReply = {};
      newReply[searchTerm] = {
        entityIds: action.pagedReply.entities.map(collectionEvent => collectionEvent.id),
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

    case CollectionEventActions.searchEventsFailure.type: {
      return {
        ...state,
        searchActive: false,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case CollectionEventActions.addEventRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case CollectionEventActions.addEventSuccess.type: {
      return adapter.addOne(action.event, {
        ...state,
        lastAddedId: action.event.id
      });
    }

    case CollectionEventActions.addEventFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case CollectionEventActions.getEventRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case CollectionEventActions.getEventSuccess.type: {
      return adapter.upsertOne(action.event, state);
    }

    case CollectionEventActions.getEventFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case CollectionEventActions.updateEventRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case CollectionEventActions.updateEventSuccess.type: {
      return adapter.updateOne(
        {
          id: action.event.id,
          changes: action.event
        },
        state
      );
    }

    case CollectionEventActions.updateEventFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case CollectionEventActions.removeEventRequest.type: {
      return {
        ...state,
        lastRemovedId: null,
        error: null
      };
    }

    case CollectionEventActions.removeEventSuccess.type: {
      return adapter.removeOne(action.eventId, {
        ...state,
        lastRemovedId: action.eventId
      });
    }

    case CollectionEventActions.removeEventFailure.type: {
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

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
