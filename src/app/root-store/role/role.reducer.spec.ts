import { reducer, initialState } from './role.reducer';
import { RoleStoreActions, RoleStoreReducer } from '.';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import { Role } from '@app/domain/access';

describe('Role Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for roles', () => {

    it('SearchRolesRequest', () => {
      const payload = {
        searchParams: new SearchParams()
      };
      const action = new RoleStoreActions.SearchRolesRequest(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
        lastSearch: payload.searchParams,
        searchActive: true
      });
    });

    it('SearchRolesSuccess', () => {
      const role = factory.role();
      const payload = {
        pagedReply: factory.pagedReply<Role>([ role ])
      };
      const action = new RoleStoreActions.SearchRolesSuccess(payload);
      const state = RoleStoreReducer.reducer(
        {
          ...RoleStoreReducer.initialState,
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
      expect(state.ids).toContain(role.id);
      expect(state.entities[role.id]).toEqual(role);
    });

    it('SearchRolesFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = new RoleStoreActions.SearchRolesFailure(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
        lastSearch: null,
        error: {
          type: action.type,
          error: action.payload.error
        }
      });
    });

  });

  describe('when updating roles', () => {

    it('UpdateRoleRequest', () => {
      const role = factory.role();
      const action = new RoleStoreActions.UpdateRoleRequest({
        role,
        attributeName: 'userAdd',
        value: factory.stringNext()
      });
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
      });
    });

    it('UpdateRoleSuccess', () => {
      const role = new Role().deserialize(factory.role());
      const action = new RoleStoreActions.UpdateRoleSuccess({ role });
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state.error).toBeNull();
      expect(state.ids).toContain(role.id);
      expect(state.entities[role.id]).toEqual(role);
    });

    it('UpdateRoleFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = new RoleStoreActions.UpdateRoleFailure(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.payload.error
        }
      });
    });

  });

  describe('when getting a single role', () => {

    it('GetRoleRequest', () => {
      const role = factory.role();
      const payload = { slug: role.slug };
      const action = new RoleStoreActions.GetRoleRequest(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
      });
    });

    it('GetRoleSuccess', () => {
      const role = factory.role();
      const payload = { role };
      const action = new RoleStoreActions.GetRoleSuccess(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state.ids).toContain(role.id);
      expect(state.entities[role.id]).toEqual(role);
    });

    it('GetRoleFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = new RoleStoreActions.GetRoleFailure(payload);
      const state = RoleStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...RoleStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.payload.error
        }
      });
    });

  });

});
