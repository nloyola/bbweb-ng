import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from '@app/core/services';
import * as loginActions from './actions';

@Injectable()
export class UserLoginStoreEffects {

  constructor(private authService: AuthService, private actions$: Actions) { }

  @Effect()
  loginRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<loginActions.LoginRequestAction>(loginActions.ActionTypes.LOGIN_REQUEST),
    map(action => action.payload),
    switchMap(payload =>
      this.authService.login(payload.email, payload.password)
        .pipe(
          map(user => new loginActions.LoginSuccessAction({ user })),
          catchError(error => observableOf(new loginActions.LoginFailureAction({ error }))))
    )
  );

  @Effect()
  logoutRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<loginActions.LogoutRequestAction>(loginActions.ActionTypes.LOGOUT_REQUEST),
    switchMap(() => {
      this.authService.logout();
      return observableOf(new loginActions.LogoutSuccessAction());
    })
  );
}
