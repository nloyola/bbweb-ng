import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Study } from '@app/domain/studies';
import { StudyActions, ActionTypes } from './study.actions';
import { SearchParamsReply, SearchParams } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';

export interface State extends EntityState<Study> {

  lastAddedId: string;

  lastSearch?: SearchParams;

  isLoadingCounts?: boolean;

  error?: any;

  searchActive?: boolean;

  searchReplies: { [ url: string ]: SearchParamsReply };

  studyCounts: StudyCounts;
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  isLoadingCounts: false,
  error: null,
  searchActive: false,
  searchReplies: {},
  studyCounts: {}
});

export function reducer(state = initialState, action: StudyActions): State {
  switch (action.type) {
    case ActionTypes.GetStudyCountsRequest: {
      return {
        ...state,
        isLoadingCounts: true,
        error: null
      };
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
      return {
        ...state,
        error: null
      };
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

    case ActionTypes.UpsertStudy: {
      return adapter.upsertOne(action.payload.study, state);
    }

    case ActionTypes.UpdateStudy: {
      return adapter.updateOne(action.payload.study, state);
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
