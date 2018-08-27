import { Action } from '@ngrx/store';
import { User } from '@app/domain/users';

export enum ActionTypes {
  LOGIN_REQUEST = '[User Login] Login Request',
  LOGIN_FAILURE = '[User Login] Login Failure',
  LOGIN_CLEAR_FAILURE = '[User Login] Login Clear Failure',
  LOGIN_SUCCESS = '[User Login] Login Success',

  LOGOUT_REQUEST = '[User Login] Logout Request',
  LOGOUT_FAILURE = '[User Login] Logout Failure',
  LOGOUT_SUCCESS = '[User Login] Logout Success',

  REGISTER_REQUEST = '[User Login] Register Request',
  REGISTER_FAILURE = '[User Login] Register Failure',
  REGISTER_CLEAR_FAILURE = '[User Login] Register Clear Failure',
  REGISTER_SUCCESS = '[User Login] Register Success',
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

export class RegisterRequestAction implements Action {
  readonly type = ActionTypes.REGISTER_REQUEST;
  constructor(public payload: { name: string, email: string, password: string }) { }
}

export class RegisterFailureAction implements Action {
  readonly type = ActionTypes.REGISTER_FAILURE;
  constructor(public payload: { error: any }) { }
}

export class RegisterClearFailureAction implements Action {
  readonly type = ActionTypes.REGISTER_CLEAR_FAILURE;
}

export class RegisterSuccessAction implements Action {
  readonly type = ActionTypes.REGISTER_SUCCESS;
  constructor(public payload: { user: User }) { }
}

export type Actions = LoginRequestAction |
  LoginFailureAction |
  LoginClearFailureAction |
  LoginSuccessAction |
  LogoutRequestAction |
  LogoutFailureAction |
  LogoutSuccessAction |
  RegisterRequestAction |
  RegisterFailureAction |
  RegisterClearFailureAction |
  RegisterSuccessAction;
