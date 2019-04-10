import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Action } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Role } from '@app/domain/access';
import { RoleUpdateAttribute } from '@app/core/services';

interface RoleUpdateRequestPayload {
  role: Role;
  attributeName: RoleUpdateAttribute;
  value: string;
}

export enum RoleActionTypes {
  SearchRolesRequest = '[Role] Search Roles Request',
  SearchRolesSuccess = '[Role] Search Roles Success',
  SearchRolesFailure = '[Roles] Search Roles Failure',

  GetRoleRequest = '[Role] Get Role Request',
  GetRoleSuccess = '[Role] Get Role Success',
  GetRoleFailure = '[Role] Get Role Failure',

  UpdateRoleRequest = '[Role] Update Role Request',
  UpdateRoleSuccess = '[Role] Update Role Success',
  UpdateRoleFailure = '[Role] Update Role Failure',

}

export class SearchRolesRequest implements Action {
  readonly type = RoleActionTypes.SearchRolesRequest;

  constructor(public payload: { searchParams: SearchParams }) { }
}

/* tslint:disable:max-classes-per-file */
export class SearchRolesSuccess implements Action {
  readonly type = RoleActionTypes.SearchRolesSuccess;

  constructor(public payload: { pagedReply: PagedReply<Role> }) { }
}

export class SearchRolesFailure implements Action {
  readonly type = RoleActionTypes.SearchRolesFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetRoleRequest implements Action {
  readonly type = RoleActionTypes.GetRoleRequest;

  constructor(public payload: { slug: string }) { }
}

@HideSpinner(RoleActionTypes.GetRoleRequest)
export class GetRoleSuccess implements Action {
  readonly type = RoleActionTypes.GetRoleSuccess;

  constructor(public payload: { role: Role }) { }
}

@HideSpinner(RoleActionTypes.GetRoleRequest)
export class GetRoleFailure implements Action {
  readonly type = RoleActionTypes.GetRoleFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class UpdateRoleRequest implements Action {
  readonly type = RoleActionTypes.UpdateRoleRequest;

  constructor(public payload: RoleUpdateRequestPayload) { }
}

@HideSpinner(RoleActionTypes.UpdateRoleRequest)
export class UpdateRoleSuccess implements Action {
  readonly type = RoleActionTypes.UpdateRoleSuccess;

  constructor(public payload: { role: Role }) { }
}

@HideSpinner(RoleActionTypes.UpdateRoleRequest)
export class UpdateRoleFailure implements Action {
  readonly type = RoleActionTypes.UpdateRoleFailure;

  constructor(public payload: { error: any }) { }
}

export type RoleActions =
  SearchRolesRequest
  | SearchRolesSuccess
  | SearchRolesFailure
  | GetRoleRequest
  | GetRoleSuccess
  | GetRoleFailure
  | UpdateRoleRequest
  | UpdateRoleSuccess
  | UpdateRoleFailure;
