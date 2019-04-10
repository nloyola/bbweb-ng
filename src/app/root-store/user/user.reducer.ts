import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { User } from '@app/domain/users';
import { UserCounts } from '@app/domain/users/user-counts.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UserActions, UserActionTypes } from './user.actions';

export interface State extends EntityState<User> {
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
  userCounts?: UserCounts;
  error?: any;
}

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialState: State = adapter.getInitialState({
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {},
  userCounts: {} as any
});

export function reducer(state = initialState, action: UserActions): State {
  switch (action.type) {
    case UserActionTypes.GetUserCountsRequest: {
      return {
        ...state,
        error: null
      };
    }

    case UserActionTypes.GetUserCountsSuccess: {
      return {
        ...state,
        userCounts: action.payload.userCounts
      };
    }

    case UserActionTypes.SearchUsersRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case UserActionTypes.SearchUsersFailure: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: UserActionTypes.SearchUsersFailure,
          error: action.payload.error
        }
      };
    }

    case UserActionTypes.SearchUsersSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
        entityIds: pagedReply.entities.map(user => user.id),
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

    case UserActionTypes.UpdateUserRequest: {
      return {
        ...state,
        error: null
      };
    }

    case UserActionTypes.UpdateUserSuccess: {
      const user: User = new User().deserialize({
        ...action.payload.user as any,
        avatarUrl: action.payload.user.avatarUrl ? action.payload.user.avatarUrl : undefined
      });
      return adapter.upsertOne(user, state);
    }

    case UserActionTypes.GetUserRequest: {
      return {
        ...state,
        error: null
      };
    }

    case UserActionTypes.GetUserSuccess: {
      return adapter.upsertOne(action.payload.user, state);
    }

    case UserActionTypes.GetUserCountsFailure:
    case UserActionTypes.GetUserFailure:
    case UserActionTypes.UpdateUserFailure:
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
