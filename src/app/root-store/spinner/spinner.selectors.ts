import { createSelector, createFeatureSelector } from "@ngrx/store";
import * as fromSpinner from './spinner.reducer';

// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

export const selectSpinnerEntity =
  createFeatureSelector<fromSpinner.State>('spinner');

export const isActive = (state: fromSpinner.State) => state.active > 0;

export const selectSpinnerIsActive = createSelector(selectSpinnerEntity, isActive);
