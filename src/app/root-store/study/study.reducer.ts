import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Study } from '@app/domain/studies';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';
import * as StudyActions from './study.actions';

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
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case StudyActions.searchStudiesFailure.type: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case StudyActions.searchStudiesSuccess.type: {
      const pagedReply = action.pagedReply;
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
      return adapter.addOne(action.study, state);
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

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
