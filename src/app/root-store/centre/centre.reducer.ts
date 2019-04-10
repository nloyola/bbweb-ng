import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Centre } from '@app/domain/centres';
import { CentreActions, ActionTypes } from './centre.actions';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { CentreCounts } from '@app/domain/centres/centre-counts.model';

export interface State extends EntityState<Centre> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  centreCounts?: CentreCounts;
  error?: any;
}

export const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {},
  centreCounts: {} as any
});

export function reducer(state = initialState, action: CentreActions): State {
  switch (action.type) {
    case ActionTypes.GetCentreCountsRequest:
    case ActionTypes.AddCentreRequest: {
      return {
        ...state,
        error: null
      };
    }

    case ActionTypes.GetCentreCountsSuccess: {
      return {
        ...state,
        centreCounts: action.payload.centreCounts
      };
    }

    case ActionTypes.SearchCentresRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case ActionTypes.SearchCentresFailure: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: ActionTypes.SearchCentresFailure,
          error: action.payload.error
        }
      };
    }

    case ActionTypes.SearchCentresSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(centre => centre.id),
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

    case ActionTypes.AddCentreRequest: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case ActionTypes.AddCentreSuccess: {
      return adapter.addOne(action.payload.centre, {
        ...state,
        lastAddedId: action.payload.centre.id
      });
    }

    case ActionTypes.UpdateCentreAddStudyRequest:
    case ActionTypes.UpdateCentreRemoveStudyRequest:
    case ActionTypes.UpdateCentreAddOrUpdateLocationRequest:
    case ActionTypes.UpdateCentreRemoveLocationRequest:
    case ActionTypes.UpdateCentreRequest: {
      return {
        ...state,
        error: null
      };
    }

    case ActionTypes.UpdateCentreSuccess: {
      return adapter.updateOne(
        {
          id: action.payload.centre.id,
          changes: action.payload.centre
        },
        state);
    }

    case ActionTypes.GetCentreSuccess: {
      return adapter.addOne(action.payload.centre, state);
    }

    case ActionTypes.GetCentreCountsFailure:
    case ActionTypes.GetCentreFailure:
    case ActionTypes.AddCentreFailure:
    case ActionTypes.UpdateCentreFailure:
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
