import { SearchParams, searchParams2Term, SearchTermToPagedReplyByEntityHash } from '@app/domain';
import { ProcessedSpecimenDefinitionName, ProcessingType } from '@app/domain/studies';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ActionTypes, ProcessingTypeActions } from './processing-type.actions';

export interface LastSearch {
  studyId: string;
  params: SearchParams;
}

export interface State extends EntityState<ProcessingType> {
  lastSearch?: LastSearch;
  searchActive?: boolean;
  searchReplies?: SearchTermToPagedReplyByEntityHash;
  specimenDefinitionNames: ProcessedSpecimenDefinitionName[];
  lastAddedId?: string;
  lastRemovedId?: string;
  error?: any;
}

export const adapter: EntityAdapter<ProcessingType> = createEntityAdapter<ProcessingType>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  specimenDefinitionNames: [],
  lastAddedId: null,
  lastRemovedId: null,
  slugsInUse: {},
  error: null
});

export function reducer(state = initialState, action: ProcessingTypeActions): State {
  switch (action.type) {
    case ActionTypes.SearchProcessingTypesRequest: {
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

    case ActionTypes.SearchProcessingTypesFailure: {
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

    case ActionTypes.SearchProcessingTypesSuccess: {
      const pagedReply = action.payload.pagedReply;
      const studyId = state.lastSearch.studyId;
      const newReply = {};
      newReply[searchParams2Term(state.lastSearch.params)] = {
        entityIds: pagedReply.entities.map(pt => pt.id),
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

    case ActionTypes.GetProcessingTypeRequest:
    case ActionTypes.GetProcessingTypeByIdRequest:
      return {
        ...state,
        error: null
      };

    case ActionTypes.GetProcessingTypeSuccess: {
      return adapter.addOne(action.payload.processingType, state);
    }

    case ActionTypes.AddProcessingTypeRequest: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ActionTypes.AddProcessingTypeSuccess: {
      return adapter.addOne(action.payload.processingType, {
        ...state,
        lastAddedId: action.payload.processingType.id
      });
    }

    case ActionTypes.UpdateProcessingTypeRequest:
    case ActionTypes.UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest:
    case ActionTypes.UpdateProcessingTypeRemoveAnnotationTypeRequest:
      return { ...state, error: null };

    case ActionTypes.UpdateProcessingTypeSuccess: {
      const result = adapter.updateOne(
        {
          id: action.payload.processingType.id,
          changes: action.payload.processingType
        },
        state
      );
      return result;
    }

    case ActionTypes.RemoveProcessingTypeRequest:
      return {
        ...state,
        lastRemovedId: null
      };

    case ActionTypes.RemoveProcessingTypeSuccess:
      return adapter.removeOne(action.payload.processingTypeId, {
        ...state,
        lastRemovedId: action.payload.processingTypeId
      });

    case ActionTypes.RemoveProcessingTypeFailure:
      return {
        ...state,
        lastRemovedId: null,
        error: {
          error: action.payload.error,
          actionType: action.type
        }
      };

    case ActionTypes.GetSpecimenDefinitionNamesSuccess: {
      return {
        ...state,
        specimenDefinitionNames: action.payload.specimenDefinitionNames
      };
    }

    case ActionTypes.ClearLastAdded: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ActionTypes.GetProcessingTypeFailure:
    case ActionTypes.AddProcessingTypeFailure:
    case ActionTypes.UpdateProcessingTypeFailure:
    case ActionTypes.GetSpecimenDefinitionNamesFailure:
      return {
        ...state,
        error: {
          error: action.payload.error,
          actionType: action.type
        }
      };

    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
