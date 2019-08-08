import { SearchParams, searchParams2Term, SearchTermToPagedReplyHash } from '@app/domain';
import { Membership } from '@app/domain/access';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import * as MembershipActions from './membership.actions';

export interface State extends EntityState<Membership> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: SearchTermToPagedReplyHash;
  error?: any;
}

export const adapter: EntityAdapter<Membership> = createEntityAdapter<Membership>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastSearch: null,
  error: null,
  searchActive: false,
  searchReplies: {}
});

export function reducer(state = initialState, action: MembershipActions.MembershipActionsUnion): State {
  switch (action.type) {
    case MembershipActions.addMembershipRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case MembershipActions.searchMembershipsRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case MembershipActions.searchMembershipsFailure.type: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          actionType: MembershipActions.searchMembershipsFailure.type,
          error: action.error
        }
      };
    }

    case MembershipActions.searchMembershipsSuccess.type: {
      const pagedReply = action.pagedReply;
      const searchTerm = searchParams2Term(state.lastSearch);
      const newReply = {};
      newReply[searchTerm] = {
        entityIds: pagedReply.entities.map(membership => membership.id),
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

    case MembershipActions.addMembershipRequest.type: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case MembershipActions.addMembershipSuccess.type: {
      return adapter.addOne(action.membership, {
        ...state,
        lastAddedId: action.membership.id
      });
    }

    case MembershipActions.updateMembershipSuccess.type: {
      return adapter.upsertOne(action.membership, state);
    }

    case MembershipActions.getMembershipRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case MembershipActions.getMembershipSuccess.type: {
      return adapter.addOne(action.membership, state);
    }

    case MembershipActions.removeMembershipSuccess.type: {
      return adapter.removeOne(action.membershipId, state);
    }

    case MembershipActions.getMembershipFailure.type:
    case MembershipActions.addMembershipFailure.type:
    case MembershipActions.updateMembershipFailure.type:
    case MembershipActions.removeMembershipFailure.type:
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
