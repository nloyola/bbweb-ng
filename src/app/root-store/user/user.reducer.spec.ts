import { reducer, initialState } from './user.reducer';
import { UserStoreActions, UserStoreReducer } from '.';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import { User } from '@app/domain/users';

describe('User Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('for user counts', () => {

    it('GetUserCountsRequest', () => {
      const action = UserStoreActions.getUserCountsRequest();
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState
      });
    });

    it('GetUserCountsSuccess', () => {
      const userCounts = factory.userCounts();
      const action = UserStoreActions.getUserCountsSuccess({ userCounts });
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        userCounts
      });
    });

    it('GetUserCountsFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = UserStoreActions.getUserCountsFailure(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when searching for users', () => {

    it('SearchUsersRequest', () => {
      const payload = {
        searchParams: new SearchParams()
      };
      const action = UserStoreActions.searchUsersRequest(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        lastSearch: payload.searchParams,
        searchActive: true
      });
    });

    it('SearchUsersSuccess', () => {
      const user = new User().deserialize(factory.user());
      const payload = {
        pagedReply: factory.pagedReply<User>([ user ])
      };
      const action = UserStoreActions.searchUsersSuccess(payload);
      const state = UserStoreReducer.reducer(
        {
          ...UserStoreReducer.initialState,
          lastSearch: payload.pagedReply.searchParams
        },
        action);

      const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
      searchReply[payload.pagedReply.searchParams.queryString()] = {
        searchParams: payload.pagedReply.searchParams,
        offset: payload.pagedReply.offset,
        total: payload.pagedReply.total,
        entityIds: payload.pagedReply.entities.map(e => e.id),
        maxPages: payload.pagedReply.maxPages
      };

      expect(state.searchReplies).toEqual(searchReply);
      expect(state.searchActive).toBe(false);
      expect(state.ids).toContain(user.id);
      expect(state.entities[user.id]).toEqual(user);
    });

    it('SearchUsersFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = UserStoreActions.searchUsersFailure(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when updating users', () => {

    it('UpdateUserRequest', () => {
      const user = new User().deserialize(factory.user());
      const action = UserStoreActions.updateUserRequest({
        user,
        attributeName: 'name',
        value: factory.stringNext()
      });
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
      });
    });

    it('UpdateUserSuccess', () => {
      const user = new User().deserialize(factory.user());
      const action = UserStoreActions.updateUserSuccess({ user });
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state.error).toBeNull();
      expect(state.ids).toContain(user.id);
      expect(state.entities[user.id]).toEqual(user);
    });

    it('UpdateUserFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = UserStoreActions.updateUserFailure(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when getting a single user', () => {

    it('GetUserRequest', () => {
      const user = factory.user();
      const payload = { slug: user.slug };
      const action = UserStoreActions.getUserRequest(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
      });
    });

    it('GetUserSuccess', () => {
      const user = new User().deserialize(factory.user());
      const payload = { user };
      const action = UserStoreActions.getUserSuccess(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state.ids).toContain(user.id);
      expect(state.entities[user.id]).toEqual(user);
    });

    it('GetUserFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = UserStoreActions.getUserFailure(payload);
      const state = UserStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...UserStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

});
