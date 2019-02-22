import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { RoleActions, RoleActionTypes } from './role.actions';

export interface State extends EntityState<Role> {
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  error?: any;
}

export const adapter: EntityAdapter<Role> = createEntityAdapter<Role>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {}
});

export function reducer(state = initialState, action: RoleActions): State {
  switch (action.type) {
    case RoleActionTypes.SearchRolesRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case RoleActionTypes.SearchRolesFailure: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: RoleActionTypes.SearchRolesFailure,
          error: action.payload.error
        }
      };
    }

    case RoleActionTypes.SearchRolesSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(role => role.id),
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages
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

    case RoleActionTypes.UpdateRoleSuccess: {
      return adapter.updateOne(
        {
          id: action.payload.role.id,
          changes: {
            ...action.payload.role
          }
        },
        state);
    }

    case RoleActionTypes.GetRoleSuccess: {
      return adapter.addOne(action.payload.role, state);
    }

    case RoleActionTypes.GetRoleFailure:
    case RoleActionTypes.UpdateRoleFailure:
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
