import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Action } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Role } from '@app/domain/access';
import { RoleUpdateAttribute } from '@app/core/services';
import { props, createAction, union } from '@ngrx/store';

export const searchRolesRequest = createAction(
  '[Role] Search Roles Request',
  props<{ searchParams: SearchParams }>()
);

export const searchRolesSuccess = createAction(
  '[Role] Search Roles Success',
  props<{ pagedReply: PagedReply<Role> }>()
);

export const searchRolesFailure = createAction(
  '[Role] Search Roles Failure',
  props<{ error: any }>()
);

export const getRoleRequest = createAction(
  '[Role] Get Role Request',
  props<{ slug: string }>()
);

export const getRoleSuccess = createAction(
  '[Role] Get Role Success',
  props<{ role: Role }>()
);

export const getRoleFailure = createAction(
  '[Role] Get Role Failure',
  props<{ error: any }>()
);

export const updateRoleRequest = createAction(
  '[Role] Update Role Request',
  props<{
    role: Role;
    attributeName: RoleUpdateAttribute;
    value: string;
   }>()
);

export const updateRoleSuccess = createAction(
  '[Role] Update Role Success',
  props<{ role: Role }>()
);

export const updateRoleFailure = createAction(
  '[Role] Update Role Failure',
  props<{ error: any }>()
);

const all = union({
  searchRolesRequest,
  searchRolesSuccess,
  searchRolesFailure,
  getRoleRequest,
  getRoleSuccess,
  getRoleFailure,
  updateRoleRequest,
  updateRoleSuccess,
  updateRoleFailure
});
export type RoleActionsUnion = typeof all;
