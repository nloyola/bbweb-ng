import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { Membership } from '@app/domain/access';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { MembershipActions, MembershipActionTypes } from './membership.actions';

export interface State extends EntityState<Membership> {
  lastAddedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [ url: string ]: PagedReplyEntityIds };
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

export function reducer(state = initialState, action: MembershipActions): State {
  switch (action.type) {
    case MembershipActionTypes.AddMembershipRequest: {
      return {
        ...state,
        error: null
      };
    }

    case MembershipActionTypes.SearchMembershipsRequest: {
      return {
        ...state,
        lastSearch: action.payload.searchParams,
        searchActive: true,
        error: null
      };
    }

    case MembershipActionTypes.SearchMembershipsFailure: {
      return {
        ...state,
        lastSearch: null,
        searchActive: false,
        error: {
          type: MembershipActionTypes.SearchMembershipsFailure,
          error: action.payload.error
        }
      };
    }

    case MembershipActionTypes.SearchMembershipsSuccess: {
      const pagedReply = action.payload.pagedReply;
      const queryString = state.lastSearch.queryString();
      const newReply = {};
      newReply[queryString] = {
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

    case MembershipActionTypes.AddMembershipRequest: {
      return {
        ...state,
        lastAddedId: null,
        error: null
      };
    }

    case MembershipActionTypes.AddMembershipSuccess: {
      return adapter.addOne(action.payload.membership, {
        ...state,
        lastAddedId: action.payload.membership.id
      });
    }

    case MembershipActionTypes.UpdateMembershipSuccess: {
      return adapter.upsertOne(action.payload.membership, state);
    }

    case MembershipActionTypes.GetMembershipRequest: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case MembershipActionTypes.GetMembershipSuccess: {
      return adapter.addOne(action.payload.membership, state);
    }

    case MembershipActionTypes.RemoveMembershipSuccess: {
      return adapter.removeOne(action.payload.membershipId, state);
    }

    case MembershipActionTypes.GetMembershipFailure:
    case MembershipActionTypes.AddMembershipFailure:
    case MembershipActionTypes.UpdateMembershipFailure:
    case MembershipActionTypes.RemoveMembershipFailure:
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
