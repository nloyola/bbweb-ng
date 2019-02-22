import { Injectable } from '@angular/core';
import { UserService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as UserActions from './user.actions';

@Injectable()
export class UserStoreEffects {

  constructor(private actions$: Actions<UserActions.UserActions>,
              private userService: UserService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UserActionTypes.GetUserRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.userService.get(payload.slug)
        .pipe(
          map(user => new UserActions.GetUserSuccess({ user })),
          catchError(error => observableOf(new UserActions.GetUserFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UserActionTypes.SearchUsersRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.userService.search(payload.searchParams)
        .pipe(
          map(pagedReply => new UserActions.SearchUsersSuccess({ pagedReply })),
          catchError(error => observableOf(new UserActions.SearchUsersFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UserActionTypes.UpdateUserRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.userService.update(payload.user, payload.attributeName, payload.value)
        .pipe(
          map(user => new UserActions.UpdateUserSuccess({ user })),
          catchError(error => observableOf(new UserActions.UpdateUserFailure({ error }))))
    )
  );

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.UserActionTypes.GetUserCountsRequest),
    switchMap(
      () =>
        this.userService.counts()
        .pipe(
          // delay(5000),
          map(userCounts => new UserActions.GetUserCountsSuccess({ userCounts })),
          catchError(error => observableOf(new UserActions.GetUserCountsFailure({ error }))))
    )
  );

}
