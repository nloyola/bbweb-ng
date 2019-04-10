import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Action } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Membership } from '@app/domain/access';
import { MembershipUpdateAttribute } from '@app/core/services';

interface MembershipUpdateRequestPayload {
  membership: Membership;
  attributeName: MembershipUpdateAttribute;
  value?: string;
}

export enum MembershipActionTypes {
  SearchMembershipsRequest = '[Membership] Search Memberships Request',
  SearchMembershipsSuccess = '[Membership] Search Memberships Success',
  SearchMembershipsFailure = '[Memberships] Search Memberships Failure',

  AddMembershipRequest = '[Membership] Add Membership Request',
  AddMembershipSuccess = '[Membership] Add Membership Success',
  AddMembershipFailure = '[Membership] Add Membership Failure',

  GetMembershipRequest = '[Membership] Get Membership Request',
  GetMembershipSuccess = '[Membership] Get Membership Success',
  GetMembershipFailure = '[Membership] Get Membership Failure',

  UpdateMembershipRequest = '[Membership] Update Membership Request',
  UpdateMembershipSuccess = '[Membership] Update Membership Success',
  UpdateMembershipFailure = '[Membership] Update Membership Failure',

  RemoveMembershipRequest = '[Membership] Remove Membership Request',
  RemoveMembershipSuccess = '[Membership] Remove Membership Success',
  RemoveMembershipFailure = '[Membership] Remove Membership Failure',
}

export class SearchMembershipsRequest implements Action {
  readonly type = MembershipActionTypes.SearchMembershipsRequest;

  constructor(public payload: { searchParams: SearchParams }) { }
}

/* tslint:disable:max-classes-per-file */
export class SearchMembershipsSuccess implements Action {
  readonly type = MembershipActionTypes.SearchMembershipsSuccess;

  constructor(public payload: { pagedReply: PagedReply<Membership> }) { }
}

export class SearchMembershipsFailure implements Action {
  readonly type = MembershipActionTypes.SearchMembershipsFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class AddMembershipRequest implements Action {
  readonly type = MembershipActionTypes.AddMembershipRequest;

  constructor(public payload: { membership: Membership }) { }
}

@HideSpinner(MembershipActionTypes.AddMembershipRequest)
export class AddMembershipSuccess implements Action {
  readonly type = MembershipActionTypes.AddMembershipSuccess;

  constructor(public payload: { membership: Membership }) { }
}

@HideSpinner(MembershipActionTypes.AddMembershipRequest)
export class AddMembershipFailure implements Action {
  readonly type = MembershipActionTypes.AddMembershipFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetMembershipRequest implements Action {
  readonly type = MembershipActionTypes.GetMembershipRequest;

  constructor(public payload: { slug: string }) { }
}

@HideSpinner(MembershipActionTypes.GetMembershipRequest)
export class GetMembershipSuccess implements Action {
  readonly type = MembershipActionTypes.GetMembershipSuccess;

  constructor(public payload: { membership: Membership }) { }
}

@HideSpinner(MembershipActionTypes.GetMembershipRequest)
export class GetMembershipFailure implements Action {
  readonly type = MembershipActionTypes.GetMembershipFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class UpdateMembershipRequest implements Action {
  readonly type = MembershipActionTypes.UpdateMembershipRequest;

  constructor(public payload: MembershipUpdateRequestPayload) { }
}

@HideSpinner(MembershipActionTypes.UpdateMembershipRequest)
export class UpdateMembershipSuccess implements Action {
  readonly type = MembershipActionTypes.UpdateMembershipSuccess;

  constructor(public payload: { membership: Membership }) { }
}

@HideSpinner(MembershipActionTypes.UpdateMembershipRequest)
export class UpdateMembershipFailure implements Action {
  readonly type = MembershipActionTypes.UpdateMembershipFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class RemoveMembershipRequest implements Action {
  readonly type = MembershipActionTypes.RemoveMembershipRequest;

  constructor(public payload: { membership: Membership }) { }
}

@HideSpinner(MembershipActionTypes.RemoveMembershipRequest)
export class RemoveMembershipSuccess implements Action {
  readonly type = MembershipActionTypes.RemoveMembershipSuccess;

  constructor(public payload: { membershipId: string }) { }
}

@HideSpinner(MembershipActionTypes.RemoveMembershipRequest)
export class RemoveMembershipFailure implements Action {
  readonly type = MembershipActionTypes.RemoveMembershipFailure;

  constructor(public payload: { error: any }) { }
}

export type MembershipActions =
  SearchMembershipsRequest
  | SearchMembershipsSuccess
  | SearchMembershipsFailure
  | AddMembershipRequest
  | AddMembershipSuccess
  | AddMembershipFailure
  | GetMembershipRequest
  | GetMembershipSuccess
  | GetMembershipFailure
  | UpdateMembershipRequest
  | UpdateMembershipSuccess
  | UpdateMembershipFailure
  | RemoveMembershipRequest
  | RemoveMembershipSuccess
  | RemoveMembershipFailure;
