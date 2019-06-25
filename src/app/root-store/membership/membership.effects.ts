import { Injectable } from '@angular/core';
import { MembershipService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as MembershipActions from './membership.actions';

@Injectable()
export class MembershipStoreEffects {

  constructor(private actions$: Actions<MembershipActions.MembershipActionsUnion>,
              private membershipService: MembershipService, ) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.getMembershipRequest.type),
    switchMap(
      action =>
        this.membershipService.get(action.slug)
        .pipe(
          map(membership => MembershipActions.getMembershipSuccess({ membership })),
          catchError(error => observableOf(MembershipActions.getMembershipFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.searchMembershipsRequest.type),
    switchMap(
      action =>
        this.membershipService.search(action.searchParams)
        .pipe(
          map(pagedReply => MembershipActions.searchMembershipsSuccess({ pagedReply })),
          catchError(error => observableOf(MembershipActions.searchMembershipsFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.addMembershipRequest.type),
    switchMap(
      action =>
        this.membershipService.add(action.membership)
        .pipe(
          map(membership => MembershipActions.addMembershipSuccess({ membership })),
          catchError(error => observableOf(MembershipActions.addMembershipFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(MembershipActions.updateMembershipRequest.type),
    switchMap(
      action =>
        this.membershipService.update(action.membership, action.attributeName, action.value)
        .pipe(
          map(membership => MembershipActions.updateMembershipSuccess({ membership })),
          catchError(error => observableOf(MembershipActions.updateMembershipFailure({ error }))))
    )
  );

  @Effect()
  removeMembershipRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType(MembershipActions.removeMembershipRequest.type),
      switchMap(
        action =>
          this.membershipService.removeMembership(action.membership)
          .pipe(
            // delay(2000),
            map(membershipId => MembershipActions.removeMembershipSuccess({ membershipId })),
            catchError(error => observableOf(MembershipActions.removeMembershipFailure({ error }))))));


}
