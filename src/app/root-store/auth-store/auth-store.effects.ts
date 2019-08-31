import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as AuthActions from './auth-store.actions';

@Injectable()
export class AuthStoreEffects {
  constructor(
    private actions$: Actions<AuthActions.AuthStoreActionsUnion>,
    private authService: AuthService
  ) {}

  @Effect()
  loginRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.loginRequestAction.type),
    switchMap(action =>
      this.authService.login(action.email, action.password).pipe(
        map(user => AuthActions.loginSuccessAction({ user })),
        catchError(error => observableOf(AuthActions.loginFailureAction({ error })))
      )
    )
  );

  @Effect()
  logoutRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.logoutRequestAction.type),
    switchMap(() => {
      this.authService.logout();
      return observableOf(AuthActions.logoutSuccessAction());
    })
  );

  @Effect()
  registerRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.registerRequestAction),
    switchMap(action =>
      this.authService.register(action.name, action.email, action.password).pipe(
        map(user => AuthActions.registerSuccessAction({ user })),
        catchError(error => observableOf(AuthActions.registerFailureAction({ error })))
      )
    )
  );
}
