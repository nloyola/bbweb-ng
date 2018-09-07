import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Study } from '@app/domain/studies';
import { StudyActions, ActionTypes } from './study.actions';
import { SearchParamsReply, SearchParams } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';

export interface State extends EntityState<Study> {

  isAdding?: boolean;

  isSearching?: boolean;

  lastSearch?: SearchParams;

  isLoadingCounts?: boolean;

  error?: any;

  searchReplies: { [ url: string ]: SearchParamsReply };

  studyCounts: StudyCounts;
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  isAdding: false,
  isSearching: false,
  lastSearch: null,
  isLoadingCounts: false,
  error: null,
  searchReplies: {},
  studyCounts: {}
});

export function reducer(state = initialState, action: StudyActions): State {
  switch (action.type) {
    case ActionTypes.GetStudyCountsRequest: {
      return { ...state, isLoadingCounts: true };
    }

    case ActionTypes.GetStudyCountsSuccess: {
      return {
        ...state,
        isLoadingCounts: false,
        studyCounts: action.payload.studyCounts
      };
    }

    case ActionTypes.GetStudyCountsFailure: {
      return {
        ...state,
        error: action.payload.error,
        isLoadingCounts: false
      };
    }

    case ActionTypes.AddStudyRequest: {
      return { ...state, isAdding: true };
    }

    case ActionTypes.AddStudySuccess: {
      return adapter.addOne(action.payload.study, { ...state, isAdding: false });
    }

    case ActionTypes.AddStudyFailure: {
      return {
        ...state,
        error: action.payload.error,
        isAdding: false
      };
    }

    case ActionTypes.UpsertStudy: {
      return adapter.upsertOne(action.payload.study, state);
    }

    case ActionTypes.UpdateStudy: {
      return adapter.updateOne(action.payload.study, state);
    }

    case ActionTypes.SearchStudiesRequest: {
      return {
        ...state,
        isSearching: true,
        lastSearch: action.payload.searchParams
      };
    }

    case ActionTypes.SearchStudiesFailure: {
      return {
        ...state,
        error: action.payload.error,
        isSearching: false,
        lastSearch: null
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
        isSearching: false,
        searchReplies: {
          ...state.searchReplies,
          ...newReply
        }
      });
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
