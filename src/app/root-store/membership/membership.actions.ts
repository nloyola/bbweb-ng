import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Action } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Membership } from '@app/domain/access';
import { MembershipUpdateAttribute } from '@app/core/services';
import { props, createAction, union } from '@ngrx/store';

export const searchMembershipsRequest = createAction(
  '[Membership] Search Memberships Request',
  props<{ searchParams: SearchParams }>()
);

export const searchMembershipsSuccess = createAction(
  '[Membership] Search Memberships Sucess',
  props<{ pagedReply: PagedReply<Membership> }>()
);

export const searchMembershipsFailure = createAction(
  '[Membership] Search Memberships Failure',
  props<{ error: any }>()
);

export const addMembershipRequest = createAction(
  '[Membership] Add Membership Request',
  props<{ membership: Membership }>()
);

export const addMembershipSuccess = createAction(
  '[Membership] Add Membership Success',
  props<{ membership: Membership }>()
);

export const addMembershipFailure = createAction(
  '[Membership] Add Membership Failure',
  props<{ error: any }>()
);

export const getMembershipRequest = createAction(
  '[Membership] Get Membership Request',
  props<{ slug: string }>()
);

export const getMembershipSuccess = createAction(
  '[Membership] Get Membership Success',
  props<{ membership: Membership }>()
);

export const getMembershipFailure = createAction(
  '[Membership] Get Membership Failure',
  props<{ error: any }>()
);

export const updateMembershipRequest = createAction(
  '[Membership] Update Membership Request',
  props<{
    membership: Membership;
    attributeName: MembershipUpdateAttribute;
    value?: string;
  }>()
);

export const updateMembershipSuccess = createAction(
  '[Membership] Update Membership Success',
  props<{ membership: Membership }>()
);

export const updateMembershipFailure = createAction(
  '[Membership] Update Membership Failure',
  props<{ error: any }>()
);

export const removeMembershipRequest = createAction(
  '[Membership] Remove Membership Request',
  props<{ membership: Membership }>()
);

export const removeMembershipSuccess = createAction(
  '[Membership] Remove Membership Success',
  props<{ membershipId: string }>()
);

export const removeMembershipFailure = createAction(
  '[Membership] Remove Membership Failure',
  props<{ error: any }>()
);

const all = union({
  searchMembershipsRequest,
  searchMembershipsSuccess,
  searchMembershipsFailure,
  addMembershipRequest,
  addMembershipSuccess,
  addMembershipFailure,
  getMembershipRequest,
  getMembershipSuccess,
  getMembershipFailure,
  updateMembershipRequest,
  updateMembershipSuccess,
  updateMembershipFailure,
  removeMembershipRequest,
  removeMembershipSuccess,
  removeMembershipFailure
});
export type MembershipActionsUnion = typeof all;
