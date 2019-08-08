import {
  PagedReplyEntityIds,
  SearchParams,
  searchParams2Term,
  SearchTermToPagedReplyHash
} from '@app/domain';
import { Centre, CentreLocationInfo } from '@app/domain/centres';
import { CentreCounts } from '@app/domain/centres/centre-counts.model';
import { SearchState } from '@app/root-store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as CentreActions from './centre.actions';

export interface LocationsSearchResultHash {
  [searchTerm: string]: CentreLocationInfo[];
}

export interface State extends EntityState<Centre> {
  searchState: SearchState<SearchTermToPagedReplyHash, SearchParams>;
  locationsSearchState: SearchState<LocationsSearchResultHash, string>;
  lastAddedId: string;
  centreCounts?: CentreCounts;
  error?: any;
}

export const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>();

export const initialState: State = adapter.getInitialState({
  locationsSearchState: {},
  searchState: {},
  lastAddedId: null,
  centreCounts: {} as any,
  error: null
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
        searchState: {
          ...state.searchState,
          lastSearch: action.searchParams,
          searchActive: true
        },
        error: null
      };
    }

    case CentreActions.searchCentresFailure.type: {
      return {
        ...state,
        searchState: {
          ...state.searchState,
          lastSearch: null,
          searchActive: false
        },
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case CentreActions.searchCentresSuccess.type: {
      const pagedReply = action.pagedReply;
      const pagedReplyEntityIds: PagedReplyEntityIds = {
        entityIds: pagedReply.entities.map(centre => centre.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
      };
      const newReply = {};
      newReply[searchParams2Term(pagedReply.searchParams)] = pagedReplyEntityIds;

      return adapter.upsertMany(pagedReply.entities, {
        ...state,
        searchState: {
          ...state.searchState,
          replies: {
            ...state.searchState.replies,
            ...newReply
          },
          searchActive: false
        }
      });
    }

    case CentreActions.searchLocationsRequest.type: {
      return {
        ...state,
        locationsSearchState: {
          ...state.locationsSearchState,
          lastSearch: action.filter,
          searchActive: true
        },
        error: null
      };
    }

    case CentreActions.searchLocationsFailure.type: {
      return {
        ...state,
        locationsSearchState: {
          ...state.locationsSearchState,
          lastSearch: null,
          searchActive: false
        },
        error: {
          actionType: action.type,
          error: action.error
        }
      };
    }

    case CentreActions.searchLocationsSuccess.type: {
      const newReply = {};
      newReply[action.searchReply.filter] = action.searchReply.centreLocations;

      return {
        ...state,
        locationsSearchState: {
          ...state.locationsSearchState,
          replies: {
            ...state.locationsSearchState.replies,
            ...newReply
          },
          searchActive: false
        }
      };
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
        state
      );
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

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
