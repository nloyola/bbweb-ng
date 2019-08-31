import { Injectable } from '@angular/core';
import { UserService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as UserActions from './user.actions';

@Injectable()
export class UserStoreEffects {
  constructor(private actions$: Actions<UserActions.UserActionsUnion>, private userService: UserService) {}

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.getUserRequest.type),
    switchMap(action =>
      this.userService.get(action.slug).pipe(
        map(user => UserActions.getUserSuccess({ user })),
        catchError(error => observableOf(UserActions.getUserFailure({ error })))
      )
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.searchUsersRequest.type),
    switchMap(action =>
      this.userService.search(action.searchParams).pipe(
        map(pagedReply => UserActions.searchUsersSuccess({ pagedReply })),
        catchError(error => observableOf(UserActions.searchUsersFailure({ error })))
      )
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.updateUserRequest.type),
    switchMap(action =>
      this.userService.update(action.user, action.attributeName, action.value).pipe(
        map(user => UserActions.updateUserSuccess({ user })),
        catchError(error => observableOf(UserActions.updateUserFailure({ error })))
      )
    )
  );

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.getUserCountsRequest.type),
    switchMap(() =>
      this.userService.counts().pipe(
        // delay(5000),
        map(userCounts => UserActions.getUserCountsSuccess({ userCounts })),
        catchError(error => observableOf(UserActions.getUserCountsFailure({ error })))
      )
    )
  );
}
