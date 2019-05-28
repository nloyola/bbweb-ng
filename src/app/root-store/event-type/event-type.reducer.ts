import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { CollectedSpecimenDefinitionName, CollectionEventType } from '@app/domain/studies';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as EventTypeActions from './event-type.actions';

export interface LastSearch {
  studyId: string;
  params: SearchParams;
}

export interface PagedReplyHash {
  [ id: string ]: { [ url: string ]: PagedReplyEntityIds };
}

export interface SpecimenDefinitionNamesByStudy {
  [ slug: string ]: CollectedSpecimenDefinitionName[];
}

export interface State extends EntityState<CollectionEventType> {
  lastSearch?: LastSearch;
  searchActive?: boolean;
  searchReplies?: PagedReplyHash;
  specimenDefinitionNames: SpecimenDefinitionNamesByStudy;
  lastAddedId: string;
  lastRemovedId: string;
  error?: any;
}

export const adapter: EntityAdapter<CollectionEventType> =
  createEntityAdapter<CollectionEventType>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  specimenDefinitionNames: {},
  lastAddedId: null,
  lastRemovedId: null,
  error: null,
});

export function reducer(state = initialState, action: EventTypeActions.EventTypeActionsUnion): State {
  switch (action.type) {

    case EventTypeActions.searchEventTypesRequest.type: {
      return {
        ...state,
        lastSearch: {
          studyId: action.studyId,
          params: action.searchParams
        },
        searchActive: true,
        error: null
      };
    }

    case EventTypeActions.searchEventTypesFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        },
        lastSearch: null,
        searchActive: false
      };
    }

    case EventTypeActions.searchEventTypesSuccess.type: {
      const pagedReply = action.pagedReply;
      const studyId = state.lastSearch.studyId;
      const queryString = state.lastSearch.params.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(et => et.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
      };

      const studyReplies = {};
      studyReplies[studyId] = {
        ...state.searchReplies[studyId],
        ...newReply
      };

      return adapter.upsertMany(pagedReply.entities, {
        ...state,
        searchReplies: {
          ...state.searchReplies,
          ...studyReplies
        },
        searchActive: false
      });
    }

    case EventTypeActions.getEventTypeSuccess.type: {
      return adapter.addOne(action.eventType, state);
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
        state);
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
        },
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
        },
      };

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
