import { User } from '@app/domain/users';
import { createAction, props, union } from '@ngrx/store';

export const loginRequestAction = createAction(
  '[User Login] Login Request',
  props<{ email: string; password: string }>()
);

export const loginFailureAction = createAction('[User Login] Login Failure', props<{ error: any }>());

export const loginSuccessAction = createAction('[User Login] Login Success', props<{ user: User }>());

export const loginClearFailureAction = createAction('[User Login] Login Clear Failure');

export const logoutRequestAction = createAction('[User Login] Logout Request');

export const logoutFailureAction = createAction('[User Login] Logout Failure', props<{ error: any }>());

export const logoutSuccessAction = createAction('[User Login] Logout Success');

export const registerRequestAction = createAction(
  '[User Login] Register Request',
  props<{ name: string; email: string; password: string }>()
);

export const registerFailureAction = createAction('[User Login] Register Failure', props<{ error: any }>());

export const registerSuccessAction = createAction('[User Login] Register Success', props<{ user: User }>());

export const registerClearFailureAction = createAction('[User Login] Register Clear Failure');

const all = union({
  loginRequestAction,
  loginFailureAction,
  loginClearFailureAction,
  loginSuccessAction,
  logoutRequestAction,
  logoutFailureAction,
  logoutSuccessAction,
  registerRequestAction,
  registerFailureAction,
  registerClearFailureAction,
  registerSuccessAction
});

export type AuthStoreActionsUnion = typeof all;
