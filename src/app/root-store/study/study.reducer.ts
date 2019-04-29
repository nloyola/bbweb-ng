import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Study } from '@app/domain/studies';
import { SearchParams, PagedReplyEntityIds, PagedReply } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';
import * as StudyActions from './study.actions';

export interface EnableAllowdIds {
  [ slug: string ]: boolean;
}

export interface SearchState<T> {
  lastSearch?: SearchParams;
  searchReplies?: { [ url: string ]: T };
  searchActive?: boolean;
}

export interface State extends EntityState<Study> {
  lastAddedId: string;
  searchState: SearchState<PagedReplyEntityIds>;
  searchCollectionStudiesState: SearchState<string[]>;
  studyCounts?: StudyCounts;
  enableAllowedIds?: EnableAllowdIds;
  error?: any;
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  searchState: {
    lastSearch: null,
    searchReplies: {},
    searchActive: false,
  },
  searchCollectionStudiesState: {
    lastSearch: null,
    searchReplies: {},
    searchActive: false,
  },
  studyCounts: {} as any,
  enableAllowedIds: {},
  error: null
});

export function reducer(
  state = initialState,
  action: StudyActions.StudyActionsUnion
): State {
  switch (action.type) {
    case StudyActions.getStudyCountsRequest.type:
    case StudyActions.addStudyRequest.type:
    case StudyActions.getEnableAllowedRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case StudyActions.getStudyCountsSuccess.type: {
      return {
        ...state,
        studyCounts: action.studyCounts
      };
    }

    case StudyActions.searchStudiesRequest.type: {
      return {
        ...state,
        searchState: searchRequest(state.searchState, action.searchParams),
        error: null
      };
    }

    case StudyActions.searchStudiesFailure.type: {
      return {
        ...state,
        searchState: searchFailure(state.searchState),
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case StudyActions.searchStudiesSuccess.type: {
      return adapter.upsertMany(action.pagedReply.entities, {
        ...state,
        searchState: searchStudiesSuccess(state.searchState, action.pagedReply),
      });
    }

    case StudyActions.searchCollectionStudiesRequest.type: {
      return {
        ...state,
        searchCollectionStudiesState: searchRequest(state.searchCollectionStudiesState, action.searchParams),
        error: null
      };
    }

    case StudyActions.searchCollectionStudiesFailure.type: {
      return {
        ...state,
        searchCollectionStudiesState: searchFailure(state.searchCollectionStudiesState),
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case StudyActions.searchCollectionStudiesSuccess.type: {
      const dtoData = action.studiesData.map(dto => new Study().deserialize({
          id: dto.id,
          slug: dto.slug,
          name: dto.name,
          state: dto.name
        }));
      const queryString = state.searchCollectionStudiesState.lastSearch.queryString();
      const newIds = {};
      newIds[queryString] = action.studiesData.map(dto => dto.id);
      return adapter.upsertMany(dtoData, {
        ...state,
        searchCollectionStudiesState: {
          ...state.searchCollectionStudiesState,
          searchReplies: {
            ...state.searchCollectionStudiesState.searchReplies,
            ...newIds
          },
          searchActive: false
        }
      });
    }

    case StudyActions.addStudyRequest.type: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case StudyActions.addStudySuccess.type: {
      return adapter.addOne(action.study, {
        ...state,
        lastAddedId: action.study.id
      });
    }

    case StudyActions.updateStudyRequest.type:
    case StudyActions.updateStudyAddOrUpdateAnnotationTypeRequest.type:
    case StudyActions.updateStudyRemoveAnnotationTypeRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case StudyActions.updateStudySuccess.type: {
      return adapter.updateOne(
        {
          id: action.study.id,
          changes: action.study
        },
        state);
    }

    case StudyActions.getStudySuccess.type: {
      return adapter.upsertOne(action.study, state);
    }

    case StudyActions.getStudyFailure.type: {
      return {
        ...state,
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case StudyActions.getEnableAllowedSuccess.type: {
      const enableAllowedIds = { ...state.enableAllowedIds };
      enableAllowedIds[action.studyId] = action.allowed;
      return {
        ...state,
        enableAllowedIds
      };
    }

    case StudyActions.getStudyCountsFailure.type:
    case StudyActions.addStudyFailure.type:
    case StudyActions.updateStudyFailure.type:
    case StudyActions.getEnableAllowedFailure.type:
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type,
        }
      };
  }
  return state;
}

function searchRequest<T>(state: SearchState<T>, searchParams: SearchParams): SearchState<T> {
  return {
    ...state,
    lastSearch: searchParams,
    searchActive: true,
  };
}

function searchStudiesSuccess(
  state: SearchState<PagedReplyEntityIds>,
  pagedReply: PagedReply<Study>
): SearchState<PagedReplyEntityIds> {
  const queryString = state.lastSearch.queryString();
  const newReply = {};
  newReply[queryString] = {
    entityIds:    pagedReply.entities.map(study => study.id),
    searchParams: pagedReply.searchParams,
    offset:       pagedReply.offset,
    total:        pagedReply.total,
    maxPages:     pagedReply.maxPages
  };
  return {
    ...state,
    searchReplies: {
      ...state.searchReplies,
      ...newReply
    },
    searchActive: false
  };
}

function searchFailure<T>(state: SearchState<T>): SearchState<T> {
  return {
    ...state,
    lastSearch: null,
    searchActive: false
  };
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
