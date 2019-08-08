import {
  SearchTermToEntityIdsByEntityIdHash,
  SearchParams,
  SearchTermToPagedReplyByEntityHash,
  searchParams2Term
} from '@app/domain';
import { CollectedSpecimenDefinitionName, CollectionEventType } from '@app/domain/studies';
import { SearchState } from '@app/root-store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as EventTypeActions from './event-type.actions';

export interface LastSearch {
  studyId: string;
  params: SearchParams;
}

export interface SpecimenDefinitionNamesByStudy {
  [slug: string]: CollectedSpecimenDefinitionName[];
}

export interface State extends EntityState<CollectionEventType> {
  searchState: SearchState<SearchTermToPagedReplyByEntityHash, LastSearch>;
  namesSearchState: SearchState<SearchTermToEntityIdsByEntityIdHash, LastSearch>;
  specimenDefinitionNames: SpecimenDefinitionNamesByStudy;
  lastAddedId: string;
  lastRemovedId: string;
  error?: any;
}

export const adapter: EntityAdapter<CollectionEventType> = createEntityAdapter<CollectionEventType>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  searchState: {
    lastSearch: null,
    searchActive: false,
    replies: {}
  },
  namesSearchState: {
    lastSearch: null,
    searchActive: false,
    replies: {}
  },
  specimenDefinitionNames: {},
  lastAddedId: null,
  lastRemovedId: null,
  error: null
});

export function reducer(state = initialState, action: EventTypeActions.EventTypeActionsUnion): State {
  switch (action.type) {
    case EventTypeActions.searchEventTypesRequest.type: {
      return {
        ...state,
        searchState: {
          ...state.searchState,
          lastSearch: {
            studyId: action.studyId,
            params: action.searchParams
          },
          searchActive: true
        },
        error: null
      };
    }

    case EventTypeActions.searchEventTypesFailure.type: {
      return {
        ...state,
        searchState: {
          ...state.searchState,
          lastSearch: null,
          searchActive: false
        },
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case EventTypeActions.searchEventTypesSuccess.type: {
      const pagedReply = action.pagedReply;
      const studyId = state.searchState.lastSearch.studyId;
      const searchTerm = searchParams2Term(state.searchState.lastSearch.params);
      const newReply = {};
      newReply[searchTerm] = {
        entityIds: pagedReply.entities.map(et => et.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
      };

      const studyReplies = {};
      studyReplies[studyId] = {
        ...state.searchState.replies[studyId],
        ...newReply
      };

      return adapter.upsertMany(pagedReply.entities, {
        ...state,
        searchState: {
          ...state.searchState,
          searchActive: false,
          replies: {
            ...state.searchState.replies,
            ...studyReplies
          }
        }
      });
    }

    case EventTypeActions.searchEventTypeNamesRequest.type: {
      return {
        ...state,
        namesSearchState: {
          ...state.namesSearchState,
          lastSearch: {
            studyId: action.studyId,
            params: action.searchParams
          },
          searchActive: true
        },
        error: null
      };
    }

    case EventTypeActions.searchEventTypeNamesFailure.type: {
      return {
        ...state,
        namesSearchState: {
          ...state.namesSearchState,
          lastSearch: null,
          searchActive: false
        },
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case EventTypeActions.searchEventTypeNamesSuccess.type: {
      const studyId = state.namesSearchState.lastSearch.studyId;
      const newReply = {};
      const searchTerm = JSON.stringify(state.namesSearchState.lastSearch.params);
      newReply[searchTerm] = action.eventTypeData.map(et => et.id);

      const studyReplies = {};
      studyReplies[studyId] = {
        ...state.namesSearchState.replies[studyId],
        ...newReply
      };

      return adapter.upsertMany(action.eventTypeData as CollectionEventType[], {
        ...state,
        namesSearchState: {
          ...state.namesSearchState,
          replies: {
            ...state.namesSearchState.replies,
            ...studyReplies
          },
          searchActive: false
        }
      });
    }

    case EventTypeActions.getEventTypeSuccess.type: {
      return adapter.upsertOne(action.eventType, state);
    }

    case EventTypeActions.addEventTypeRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case EventTypeActions.addEventTypeSuccess.type: {
      return adapter.addOne(action.eventType, {
        ...state,
        lastAddedId: action.eventType.id
      });
    }

    case EventTypeActions.updateEventTypeRequest.type:
      return { ...state, error: null };

    case EventTypeActions.updateEventTypeSuccess.type: {
      return adapter.updateOne(
        {
          id: action.eventType.id,
          changes: action.eventType
        },
        state
      );
    }

    case EventTypeActions.removeEventTypeRequest.type:
      return {
        ...state,
        lastRemovedId: null
      };

    case EventTypeActions.removeEventTypeSuccess.type:
      return adapter.removeOne(action.eventTypeId, {
        ...state,
        lastRemovedId: action.eventTypeId
      });

    case EventTypeActions.removeEventTypeFailure.type:
      return {
        ...state,
        lastRemovedId: null,
        error: {
          error: action.error,
          actionType: action.type
        }
      };

    case EventTypeActions.getSpecimenDefinitionNamesSuccess.type: {
      const studyDefinitions = {};
      studyDefinitions[action.studySlug] = action.specimenDefinitionNames;
      return {
        ...state,
        specimenDefinitionNames: {
          ...state.specimenDefinitionNames,
          ...studyDefinitions
        }
      };
    }

    case EventTypeActions.clearLastAdded.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case EventTypeActions.updateEventTypeFailure.type:
    case EventTypeActions.addEventTypeFailure.type:
    case EventTypeActions.getEventTypeFailure.type:
    case EventTypeActions.removeEventTypeFailure.type:
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };

    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
