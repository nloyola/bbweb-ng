import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { filter, map } from "rxjs/operators";
import * as spinnerActions from './spinner.actions';

// borrowed from here:
//
// https://itnext.io/angular-tutorial-create-loading-indicator-using-ngrx-687f8a66be0d

@Injectable()
export class SpinnerEffects {

  constructor(private actions$: Actions) {}

  @Effect()
  showLoader$ = this.actions$.pipe(
    filter((action: any) => action && action.showLoader ? action : null),
    map((action: any) => new spinnerActions.ShowSpinner(action))
  );

  @Effect()
  hideLoader$ = this.actions$.pipe(
    filter((action: any) => action && action.triggerAction ? action : null),
    map((action: any) => new spinnerActions.HideSpinner(action))
  );
}
