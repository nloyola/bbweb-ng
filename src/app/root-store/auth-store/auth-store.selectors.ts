import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './auth-store.reducer';
import { User } from '@app/domain/users';

export const selectAuthState = createFeatureSelector<State>('auth');

export const getError = (state: State): any => state.error;

export const getUser = (state: State): User => state.user;

export const getRegisteredUser = (state: State): User => state.registeredUser;

export const selectAuthError: MemoizedSelector<object, any> = createSelector(
  selectAuthState,
  getError
);

export const selectUserLogoutError: MemoizedSelector<object, any> = createSelector(
  selectAuthState,
  getError
);

export const selectAuthUser: MemoizedSelector<object, User> = createSelector(
  selectAuthState,
  getUser
);

export const selectAuthRegisteredUser: MemoizedSelector<object, User> = createSelector(
  selectAuthState,
  getRegisteredUser
);
