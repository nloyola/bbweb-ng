import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { EventTypeActions, ActionTypes } from './event-type.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { CollectionEventType, CollectedSpecimenDefinitionName } from '@app/domain/studies';

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

export function reducer(state = initialState, action: EventTypeActions): State {
  switch (action.type) {

    case ActionTypes.SearchEventTypesRequest: {
      return {
        ...state,
        lastSearch: {
          studyId: action.payload.studyId,
          params: action.payload.searchParams
        },
        searchActive: true,
        error: null
      };
    }

    case ActionTypes.SearchEventTypesFailure: {
      return {
        ...state,
        error: {
          error: action.payload.error,
          actionType: action.type
        },
        lastSearch: null,
        searchActive: false
      };
    }

    case ActionTypes.SearchEventTypesSuccess: {
      const pagedReply = action.payload.pagedReply;
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

    case ActionTypes.GetEventTypeSuccess: {
      return adapter.addOne(action.payload.eventType, state);
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

    case ActionTypes.UpdateEventTypeRequest:
    case ActionTypes.UpdateEventTypeAddOrUpdateAnnotationTypeRequest:
    case ActionTypes.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest:
    case ActionTypes.UpdateEventTypeRemoveAnnotationTypeRequest:
    case ActionTypes.UpdateEventTypeRemoveSpecimenDefinitionRequest:
      return { ...state, error: null };

    case ActionTypes.UpdateEventTypeSuccess: {
      return adapter.updateOne(
        {
          id: action.payload.eventType.id,
          changes: action.payload.eventType
        },
        state);
    }

    case ActionTypes.RemoveEventTypeRequest:
      return {
        ...state,
        lastRemovedId: null
      };

    case ActionTypes.RemoveEventTypeSuccess:
      return adapter.removeOne(action.payload.eventTypeId, {
        ...state,
        lastRemovedId: action.payload.eventTypeId
      });

    case ActionTypes.RemoveEventTypeFailure:
      return {
        ...state,
        lastRemovedId: null,
        error: {
          error: action.payload.error,
          actionType: action.type
        },
      };

    case ActionTypes.GetSpecimenDefinitionNamesSuccess: {
      const studyDefinitions = {};
      studyDefinitions[action.payload.studySlug] = action.payload.specimenDefinitionNames;
      return {
        ...state,
        specimenDefinitionNames: {
          ...state.specimenDefinitionNames,
          ...studyDefinitions
        }
      };
    }

    case ActionTypes.ClearLastAdded: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ActionTypes.UpdateEventTypeFailure:
    case ActionTypes.AddEventTypeFailure:
    case ActionTypes.GetEventTypeFailure:
    case ActionTypes.RemoveEventTypeFailure:
      return {
        ...state,
        error: {
          error: action.payload.error,
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
