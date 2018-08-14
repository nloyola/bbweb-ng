import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import { User } from '@app/domain/users/user.model';

import { State } from './state';

export const getError = (state: State): any => state.error;

export const getUser = (state: State): User => state.user;

export const selectUserLoginState = createFeatureSelector<State>('userLogin');

export const selectUserLoginError: MemoizedSelector<object, any> =
  createSelector(selectUserLoginState, getError);

export const selectUserLogoutError: MemoizedSelector<object, any> =
  createSelector(selectUserLoginState, getError);

export const selectUserLoginUser: MemoizedSelector<object, User> =
  createSelector(selectUserLoginState, getUser);
