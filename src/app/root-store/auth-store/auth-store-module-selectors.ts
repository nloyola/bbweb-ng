import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import { User } from '@app/domain/users';

import { State } from './auth-store-module-state';

export const getIsLogginIn = (state: State): any => state.isLoggingIn;

export const getIsRegistering = (state: State): any => state.isRegistering;

export const getError = (state: State): any => state.error;

export const getUser = (state: State): User => state.user;

export const getRegisteredUser = (state: State): User => state.registeredUser;

export const selectAuthState = createFeatureSelector<State>('auth');

export const selectAuthIsLoggingIn: MemoizedSelector<object, boolean> =
  createSelector(selectAuthState, getIsLogginIn);

export const selectAuthIsRegistering: MemoizedSelector<object, boolean> =
  createSelector(selectAuthState, getIsLogginIn);

export const selectAuthError: MemoizedSelector<object, any> =
  createSelector(selectAuthState, getError);

export const selectUserLogoutError: MemoizedSelector<object, any> =
  createSelector(selectAuthState, getError);

export const selectAuthUser: MemoizedSelector<object, User> =
  createSelector(selectAuthState, getUser);

export const selectAuthRegisteredUser: MemoizedSelector<object, User> =
  createSelector(selectAuthState, getRegisteredUser);
