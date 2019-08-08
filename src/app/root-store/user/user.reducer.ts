import { PagedReplyEntityIds, SearchParams, searchParams2Term } from '@app/domain';
import { User } from '@app/domain/users';
import { UserCounts } from '@app/domain/users/user-counts.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as UserActions from './user.actions';

export interface State extends EntityState<User> {
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [url: string]: PagedReplyEntityIds };
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

export function reducer(state = initialState, action: UserActions.UserActionsUnion): State {
  switch (action.type) {
    case UserActions.getUserCountsRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case UserActions.getUserCountsSuccess.type: {
      return {
        ...state,
        userCounts: action.userCounts
      };
    }

    case UserActions.searchUsersRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case UserActions.searchUsersFailure.type: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          actionType: UserActions.searchUsersFailure.type,
          error: action.error
        }
      };
    }

    case UserActions.searchUsersSuccess.type: {
      const pagedReply = action.pagedReply;
      const searchTerm = searchParams2Term(state.lastSearch);
      const newReply = {};
      newReply[searchTerm] = {
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

    case UserActions.updateUserRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case UserActions.updateUserSuccess.type: {
      const user: User = new User().deserialize({
        ...(action.user as any),
        avatarUrl: action.user.avatarUrl ? action.user.avatarUrl : undefined
      });
      return adapter.upsertOne(user, state);
    }

    case UserActions.getUserRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case UserActions.getUserSuccess.type: {
      return adapter.upsertOne(action.user, state);
    }

    case UserActions.getUserCountsFailure.type:
    case UserActions.getUserFailure.type:
    case UserActions.updateUserFailure.type:
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
