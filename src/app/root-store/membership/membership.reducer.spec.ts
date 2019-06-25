import { reducer, initialState } from './membership.reducer';
import { MembershipStoreActions, MembershipStoreReducer } from '.';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import { Membership } from '@app/domain/access';

describe('Membership Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for memberships', () => {

    it('SearchMembershipsRequest', () => {
      const payload = {
        searchParams: new SearchParams()
      };
      const action = MembershipStoreActions.searchMembershipsRequest(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
        lastSearch: payload.searchParams,
        searchActive: true
      });
    });

    it('SearchMembershipsSuccess', () => {
      const membership = new Membership().deserialize(factory.membership());
      const payload = {
        pagedReply: factory.pagedReply<Membership>([ membership ])
      };
      const action = MembershipStoreActions.searchMembershipsSuccess(payload);
      const state = MembershipStoreReducer.reducer(
        {
          ...MembershipStoreReducer.initialState,
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
      expect(state.ids).toContain(membership.id);
      expect(state.entities[membership.id]).toEqual(membership);
    });

    it('SearchMembershipsFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = MembershipStoreActions.searchMembershipsFailure(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('for adding a membership', () => {

    it('AddMembershipRequest', () => {
      const membership = new Membership().deserialize(factory.membership());
      const action = MembershipStoreActions.addMembershipRequest({ membership });
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state.lastAddedId).toBeNull();
      expect(state.error).toBeNull();
    });

    it('AddMembershipSuccess', () => {
      const membership = new Membership().deserialize(factory.membership());
      const payload = { membership };
      const action = MembershipStoreActions.addMembershipSuccess(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state.ids).toContain(membership.id);
      expect(state.entities[membership.id]).toEqual(membership);
    });

    it('AddMembershipFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = MembershipStoreActions.addMembershipFailure(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: payload.error
        }
      });
    });
  });

  describe('when updating memberships', () => {

    it('UpdateMembershipRequest', () => {
      const membership = new Membership().deserialize(factory.membership());
      const action = MembershipStoreActions.updateMembershipRequest({
        membership,
        attributeName: 'name',
        value: factory.stringNext()
      });
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
      });
    });

    it('UpdateMembershipSuccess', () => {
      const membership = new Membership().deserialize(factory.membership());
      const action = MembershipStoreActions.updateMembershipSuccess({ membership });
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state.error).toBeNull();
      expect(state.ids).toContain(membership.id);
      expect(state.entities[membership.id]).toEqual(membership);
    });

    it('UpdateMembershipFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = MembershipStoreActions.updateMembershipFailure(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when getting a single membership', () => {

    it('GetMembershipRequest', () => {
      const membership = new Membership().deserialize(factory.membership());
      const payload = { slug: membership.slug };
      const action = MembershipStoreActions.getMembershipRequest(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
      });
    });

    it('GetMembershipSuccess', () => {
      const membership = new Membership().deserialize(factory.membership());
      const payload = { membership };
      const action = MembershipStoreActions.getMembershipSuccess(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state.ids).toContain(membership.id);
      expect(state.entities[membership.id]).toEqual(membership);
    });

    it('GetMembershipFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = MembershipStoreActions.getMembershipFailure(payload);
      const state = MembershipStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...MembershipStoreReducer.initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('for removing a membership', () => {

    let membership: Membership;
    let testInitialState: any;

    beforeEach(() => {
      membership = new Membership().deserialize(factory.membership());
      testInitialState = {
        ...MembershipStoreReducer.initialState,
        ids: [ membership.id ],
        entities: {}
      };
      testInitialState['entities'][membership.id] = membership;
    });

    it('RemoveMembershipSuccess', () => {
      const payload = { membershipId: membership.id };
      const action = MembershipStoreActions.removeMembershipSuccess(payload);
      const state = MembershipStoreReducer.reducer(initialState, action);

      expect(state.ids).not.toContain(membership.id);
      expect(state.entities[membership.id]).toBeUndefined();
    });

    it('RemoveMembershipFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = MembershipStoreActions.removeMembershipFailure(payload);
      const state = MembershipStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });
  });

});
