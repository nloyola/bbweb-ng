import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Study } from '@app/domain/studies';
import { StudyActions, ActionTypes } from './study.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';

export interface EnableAllowdIds {
  [ slug: string ]: boolean;
}

export interface State extends EntityState<Study> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  studyCounts?: StudyCounts;
  enableAllowedIds?: EnableAllowdIds;
  error?: any;
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {},
  studyCounts: {} as any,
  enableAllowedIds: {}
});

export function reducer(state = initialState, action: StudyActions): State {
  switch (action.type) {
    case ActionTypes.GetStudyCountsRequest:
    case ActionTypes.AddStudyRequest:
    case ActionTypes.GetEnableAllowedRequest: {
      return {
        ...state,
        error: null
      };
    }

    case ActionTypes.GetStudyCountsSuccess: {
      return {
        ...state,
        studyCounts: action.payload.studyCounts
      };
    }

    case ActionTypes.SearchStudiesRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case ActionTypes.SearchStudiesFailure: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: ActionTypes.SearchStudiesFailure,
          error: action.payload.error
        }
      };
    }

    case ActionTypes.SearchStudiesSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(study => study.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
      };

      return adapter.upsertMany(pagedReply.entities, {
        ...state,
        searchReplies: {
          ...state.searchReplies,
          ...newReply
        },
        searchActive: false
      });
    }

    case ActionTypes.AddStudyRequest: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case ActionTypes.AddStudySuccess: {
      return adapter.addOne(action.payload.study, {
        ...state,
        lastAddedId: action.payload.study.id
      });
    }

    case ActionTypes.UpdateStudyRequest:
    case ActionTypes.UpdateStudyAddOrUpdateAnnotationTypeRequest:
    case ActionTypes.UpdateStudyRemoveAnnotationTypeRequest: {
      return {
        ...state,
        error: null
      };
    }

    case ActionTypes.UpdateStudySuccess: {
      return adapter.updateOne(
        {
          id: action.payload.study.id,
          changes: action.payload.study
        },
        state);
    }

    case ActionTypes.GetStudySuccess: {
      return adapter.addOne(action.payload.study, state);
    }

    case ActionTypes.GetStudyFailure: {
      return {
        ...state,
        error: {
          type: ActionTypes.GetStudyFailure,
          error: action.payload.error
        }
      };
    }

    case ActionTypes.GetEnableAllowedSuccess: {
      const enableAllowedIds = { ...state.enableAllowedIds };
      enableAllowedIds[action.payload.studyId] = action.payload.allowed;
      return {
        ...state,
        enableAllowedIds
      };
    }

    case ActionTypes.GetStudyCountsFailure:
    case ActionTypes.AddStudyFailure:
    case ActionTypes.UpdateStudyFailure:
    case ActionTypes.GetEnableAllowedFailure:
      return {
        ...state,
        error: {
          error: action.payload.error,
          actionType: action.type
        }
      };
  }
  return state;
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
