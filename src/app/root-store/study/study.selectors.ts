import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import { State } from './study.reducer';
import { Study } from '@app/domain/studies';

export const getIsAdding = (state: State): any => state.isAdding;

export const getError = (state: State): any => state.error;

export const selectStudyState = createFeatureSelector<State>('study');

export const selectStudyIsAdding: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsAdding);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);
