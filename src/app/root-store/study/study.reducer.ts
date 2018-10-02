import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Study } from '@app/domain/studies';
import { StudyActions, ActionTypes } from './study.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';

export interface State extends EntityState<Study> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  error?: any;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  studyCounts?: StudyCounts;
  enableAllowedIds?: string[];
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {},
  studyCounts: {},
  enableAllowedIds: []
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

    case ActionTypes.GetStudyCountsFailure: {
      return {
        ...state,
        error: action.payload.error
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
        error: action.payload.error,
        lastSearch: null,
        searchActive: false
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
        total: pagedReply.total
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

    case ActionTypes.AddStudySuccess: {
      return adapter.addOne(action.payload.study, {
        ...state,
        lastAddedId: action.payload.study.id
      });
    }

    case ActionTypes.AddStudyFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.UpdateStudySuccess: {
      return adapter.updateOne(
        {
          id: action.payload.study.id,
          changes: action.payload.study,
        },
        state);
    }

    case ActionTypes.UpdateStudyFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.GetStudySuccess: {
      return adapter.addOne(action.payload.study, state);
    }

    case ActionTypes.GetStudyFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }

    case ActionTypes.GetEnableAllowedSuccess: {
      if (action.payload.allowed) {
        const included = state.enableAllowedIds.includes(action.payload.studyId)
        if (!included) {
          const enableAllowedIds = [ ...state.enableAllowedIds, action.payload.studyId ];
          return {
            ...state,
            enableAllowedIds
          };
        }
      }
      return state;
    }

    case ActionTypes.GetEnableAllowedFailure: {
      return {
        ...state,
        error: action.payload.error
      };
    }
  }
  return state;
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
