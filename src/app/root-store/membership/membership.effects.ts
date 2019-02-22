import { Injectable } from '@angular/core';
import { MembershipService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as MembershipActions from './membership.actions';

@Injectable()
export class MembershipStoreEffects {

  constructor(private actions$: Actions<MembershipActions.MembershipActions>,
              private membershipService: MembershipService, ) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.MembershipActionTypes.GetMembershipRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.membershipService.get(payload.slug)
        .pipe(
          map(membership => new MembershipActions.GetMembershipSuccess({ membership })),
          catchError(error => observableOf(new MembershipActions.GetMembershipFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.MembershipActionTypes.SearchMembershipsRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.membershipService.search(payload.searchParams)
        .pipe(
          map(pagedReply => new MembershipActions.SearchMembershipsSuccess({ pagedReply })),
          catchError(error => observableOf(new MembershipActions.SearchMembershipsFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.MembershipActionTypes.AddMembershipRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.membershipService.add(payload.membership)
        .pipe(
          map(membership => new MembershipActions.AddMembershipSuccess({ membership })),
          catchError(error => observableOf(new MembershipActions.AddMembershipFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.MembershipActionTypes.UpdateMembershipRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.membershipService.update(payload.membership, payload.attributeName, payload.value)
        .pipe(
          map(membership => new MembershipActions.UpdateMembershipSuccess({ membership })),
          catchError(error => observableOf(new MembershipActions.UpdateMembershipFailure({ error }))))
    )
  );

}
