import { Injectable } from '@angular/core';
import { CentreService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as CentreActions from './centre.actions';

@Injectable()
export class CentreStoreEffects {

  constructor(private actions$: Actions<CentreActions.CentreActionsUnion>,
              private centreService: CentreService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.getCentreRequest.type),
    switchMap(
      props =>
        this.centreService.get(props.slug)
        .pipe(
          map(centre => CentreActions.getCentreSuccess({ centre })),
          catchError(error => observableOf(CentreActions.getCentreFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.searchCentresRequest.type),
    switchMap(
      props =>
        this.centreService.search(props.searchParams)
        .pipe(
          map(pagedReply => CentreActions.searchCentresSuccess({ pagedReply })),
          catchError(error => observableOf(CentreActions.searchCentresFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.addCentreRequest.type),
    switchMap(
      props =>
        this.centreService.add(props.centre)
        .pipe(
          map(centre => CentreActions.addCentreSuccess({ centre })),
          catchError(error => observableOf(CentreActions.addCentreFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.updateCentreRequest.type),
    switchMap(
      props =>
        this.centreService.update(props.centre, props.attributeName, props.value)
        .pipe(
          map(centre => CentreActions.updateCentreSuccess({ centre })),
          catchError(error => observableOf(CentreActions.updateCentreFailure({ error }))))
    )
  );

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.getCentreCountsRequest.type),
    switchMap(
      () =>
        this.centreService.counts()
        .pipe(
          // delay(5000),
          map(centreCounts => CentreActions.getCentreCountsSuccess({ centreCounts })),
          catchError(error => observableOf(CentreActions.getCentreCountsFailure({ error }))))
    )
  );

}
