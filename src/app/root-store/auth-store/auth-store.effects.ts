import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as AuthActions from './auth-store.actions';

@Injectable()
export class AuthStoreEffects {

  constructor(private actions$: Actions<AuthActions.Actions>,
              private authService: AuthService) { }

  @Effect()
  loginRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.ActionTypes.LOGIN_REQUEST),
    map(action => action.payload),
    switchMap(
      payload =>
        this.authService.login(payload.email, payload.password)
        .pipe(
          map(user => new AuthActions.LoginSuccessAction({ user })),
          catchError(error => observableOf(new AuthActions.LoginFailureAction({ error }))))
             )
  );

  @Effect()
  logoutRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.ActionTypes.LOGOUT_REQUEST),
    switchMap(() => {
      this.authService.logout();
      return observableOf(new AuthActions.LogoutSuccessAction());
    })
  );

  @Effect()
  registerRequest$: Observable<Action> = this.actions$.pipe(
    ofType(AuthActions.ActionTypes.REGISTER_REQUEST),
    map(action => action.payload),
    switchMap(
      payload =>
        this.authService.register(payload.name, payload.email, payload.password)
        .pipe(
          map(user => new AuthActions.RegisterSuccessAction({ user })),
          catchError(error => observableOf(new AuthActions.RegisterFailureAction({ error }))))
    )
  );

}
