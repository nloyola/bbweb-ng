import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from '@app/core/services';
import * as authActions from './actions';

@Injectable()
export class UserLoginStoreEffects {

  constructor(private authService: AuthService, private actions$: Actions) { }

  @Effect()
  loginRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<authActions.LoginRequestAction>(authActions.ActionTypes.LOGIN_REQUEST),
    map(action => action.payload),
    switchMap(payload =>
      this.authService.login(payload.email, payload.password)
        .pipe(
          map(user => new authActions.LoginSuccessAction({ user })),
          catchError(error => observableOf(new authActions.LoginFailureAction({ error }))))
    )
  );

  @Effect()
  logoutRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<authActions.LogoutRequestAction>(authActions.ActionTypes.LOGOUT_REQUEST),
    switchMap(() => {
      this.authService.logout();
      return observableOf(new authActions.LogoutSuccessAction());
    })
  );

  @Effect()
  registerRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<authActions.RegisterRequestAction>(authActions.ActionTypes.REGISTER_REQUEST),
    map(action => action.payload),
    switchMap(payload =>
      this.authService.register(payload.name, payload.email, payload.password)
        .pipe(
          map(user => new authActions.RegisterSuccessAction({ user })),
          catchError(error => observableOf(new authActions.RegisterFailureAction({ error }))))
    )
  );

}
