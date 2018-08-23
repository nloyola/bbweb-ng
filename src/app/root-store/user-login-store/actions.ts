import { Action } from '@ngrx/store';
import { User } from '@app/domain/users/user.model';

export enum ActionTypes {
  LOGIN_REQUEST = '[User Login] Login Request',
  LOGIN_FAILURE = '[User Login] Login Failure',
  LOGIN_CLEAR_FAILURE = '[User Login] Login Clear Failure',
  LOGIN_SUCCESS = '[User Login] Login Success',
  LOGOUT_REQUEST = '[User Login] Logout Request',
  LOGOUT_FAILURE = '[User Login] Logout Failure',
  LOGOUT_SUCCESS = '[User Login] Logout Success'
}

export class LoginRequestAction implements Action {
  readonly type = ActionTypes.LOGIN_REQUEST;
  constructor(public payload: { email: string, password: string }) { }
}

export class LoginFailureAction implements Action {
  readonly type = ActionTypes.LOGIN_FAILURE;
  constructor(public payload: { error: string }) { }
}

export class LoginClearFailureAction implements Action {
  readonly type = ActionTypes.LOGIN_CLEAR_FAILURE;
}

export class LoginSuccessAction implements Action {
  readonly type = ActionTypes.LOGIN_SUCCESS;
  constructor(public payload: { user: User }) { }
}

export class LogoutRequestAction implements Action {
  readonly type = ActionTypes.LOGOUT_REQUEST;
}

export class LogoutFailureAction implements Action {
  readonly type = ActionTypes.LOGOUT_FAILURE;
  constructor(public payload: { error: string }) { }
}

export class LogoutSuccessAction implements Action {
  readonly type = ActionTypes.LOGOUT_SUCCESS;
}

export type Actions = LoginRequestAction |
  LoginFailureAction |
  LoginClearFailureAction |
  LoginSuccessAction |
  LogoutRequestAction |
  LogoutFailureAction |
  LogoutSuccessAction;
