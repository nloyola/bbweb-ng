import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Action } from '@ngrx/store';
import { UserCounts } from '@app/domain/users/user-counts.model';
import { SearchParams, PagedReply } from '@app/domain';
import { User } from '@app/domain/users';
import { UserUpdateAttribute, PasswordUpdateValues } from '@app/core/services';
import { props, createAction, union } from '@ngrx/store';

export const getUserCountsRequest = createAction(
  '[User] Get User Count Request',
);

export const getUserCountsSuccess = createAction(
  '[Centre] Get Centre Count Request',
  props<{ userCounts: UserCounts }>()
);

export const getUserCountsFailure = createAction(
  '[Centre] Get Centre Count Failure',
  props<{ error: any }>()
);

export const searchUsersRequest = createAction(
  '[User] Search Users Request',
  props<{ searchParams: SearchParams }>()
);

export const searchUsersSuccess = createAction(
  '[User] Search Users Success',
  props<{ pagedReply: PagedReply<User> }>()
);

export const searchUsersFailure = createAction(
  '[User] Search Users Failure',
  props<{ error: any }>()
);

export const getUserRequest = createAction(
  '[User] Get User Request',
  props<{ slug: string }>()
);

export const getUserSuccess = createAction(
  '[User] Get User Success',
  props<{ user: User }>()
);

export const getUserFailure = createAction(
  '[User] Get User Failure',
  props<{ error: any }>()
);

export const updateUserRequest = createAction(
  '[User] Update User Request',
  props<{ 
    user: User;
    attributeName: UserUpdateAttribute;
    value: string | PasswordUpdateValues;
  }>()
);

export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: any }>()
);


  const all = union({
    getUserCountsRequest,
    getUserCountsSuccess,
    getUserCountsFailure,
    searchUsersRequest,
    searchUsersSuccess,
    searchUsersFailure,
    getUserRequest,
    getUserSuccess,
    getUserFailure,
    updateUserRequest,
    updateUserSuccess,
    updateUserFailure
  });
  export type UserActionsUnion = typeof all;