import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as RoleActions from './role.actions';

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

export function reducer(state = initialState, action: RoleActions.RoleActionsUnion): State {
  switch (action.type) {
    case RoleActions.searchRolesRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case RoleActions.searchRolesFailure.type: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: RoleActions.searchRolesFailure.type,
          error: action.error
        }
      };
    }

    case RoleActions.searchRolesSuccess.type: {
      const pagedReply = action.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(role => role.id),
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

    case RoleActions.updateRoleSuccess.type: {
      return adapter.upsertOne(action.role, state);
    }

    case RoleActions.getRoleSuccess.type: {
      return adapter.addOne(action.role, state);
    }

    case RoleActions.getRoleFailure.type:
    case RoleActions.updateRoleFailure.type:
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
