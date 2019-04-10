import { Action } from '@ngrx/store';

// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

export enum SpinnerActionTypes {
  ShowSpinner = '[UI] Show Spinner',
  HideSpinner = '[UI] Hide Spinner'
}

export class ShowSpinner implements Action {
  readonly type = SpinnerActionTypes.ShowSpinner;

  constructor(public payload?: any) { }
}

/* tslint:disable:max-classes-per-file */
export class HideSpinner implements Action {
  readonly type = SpinnerActionTypes.HideSpinner;

  constructor(public payload?: any) { }
}

export type SpinnerActions = ShowSpinner | HideSpinner;
