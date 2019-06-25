import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Centre } from '@app/domain/centres';
import * as CentreActions from './centre.actions';
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

export function reducer(state = initialState, action: CentreActions.CentreActionsUnion): State {
  switch (action.type) {
    case CentreActions.getCentreCountsRequest.type:
    case CentreActions.addCentreRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case CentreActions.getCentreCountsSuccess.type: {
      return {
        ...state,
        centreCounts: action.centreCounts
      };
    }

    case CentreActions.searchCentresRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case CentreActions.searchCentresFailure.type: {
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

    case CentreActions.searchCentresSuccess.type: {
      const pagedReply = action.pagedReply;
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

    case CentreActions.addCentreRequest.type: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case CentreActions.addCentreSuccess.type: {
      return adapter.addOne(action.centre, {
        ...state,
        lastAddedId: action.centre.id
      });
    }

    case CentreActions.updateCentreRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case CentreActions.updateCentreSuccess.type: {
      return adapter.updateOne(
        {
          id: action.centre.id,
          changes: action.centre
        },
        state);
    }

    case CentreActions.getCentreSuccess.type: {
      return adapter.addOne(action.centre, state);
    }

    case CentreActions.getCentreCountsFailure.type:
    case CentreActions.getCentreFailure.type:
    case CentreActions.addCentreFailure.type:
    case CentreActions.updateCentreFailure.type:
      return {
        ...state,
        error: {
          error: action.error,
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
