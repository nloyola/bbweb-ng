import { Injectable } from '@angular/core';
import { CentreService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as CentreActions from './centre.actions';

@Injectable()
export class CentreStoreEffects {

  constructor(private actions$: Actions<CentreActions.CentreActions>,
              private centreService: CentreService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.GetCentreRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.get(payload.slug)
        .pipe(
          map(centre => new CentreActions.GetCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.GetCentreFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.SearchCentresRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.search(payload.searchParams)
        .pipe(
          map(pagedReply => new CentreActions.SearchCentresSuccess({ pagedReply })),
          catchError(error => observableOf(new CentreActions.SearchCentresFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.AddCentreRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.add(payload.centre)
        .pipe(
          map(centre => new CentreActions.AddCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.AddCentreFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.UpdateCentreRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.update(payload.centre, payload.attributeName, payload.value)
        .pipe(
          map(centre => new CentreActions.UpdateCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.UpdateCentreFailure({ error }))))
    )
  );

  @Effect()
  addStudyRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.UpdateCentreAddStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.addStudy(payload.centre, payload.studyId)
        .pipe(
          map(centre => new CentreActions.UpdateCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.UpdateCentreFailure({ error }))))
    )
  );

  @Effect()
  removeStudyRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.UpdateCentreRemoveStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.removeStudy(payload.centre, payload.studyId)
        .pipe(
          map(centre => new CentreActions.UpdateCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.UpdateCentreFailure({ error }))))
    )
  );

  @Effect()
  addLocationRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.UpdateCentreAddOrUpdateLocationRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.addOrUpdateLocation(payload.centre, payload.location)
        .pipe(
          map(centre => new CentreActions.UpdateCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.UpdateCentreFailure({ error }))))
    )
  );

  @Effect()
  removeLocationRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.UpdateCentreRemoveLocationRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.centreService.removeLocation(payload.centre, payload.locationId)
        .pipe(
          map(centre => new CentreActions.UpdateCentreSuccess({ centre })),
          catchError(error => observableOf(new CentreActions.UpdateCentreFailure({ error }))))
    )
  );

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType(CentreActions.ActionTypes.GetCentreCountsRequest),
    switchMap(
      () =>
        this.centreService.counts()
        .pipe(
          // delay(5000),
          map(centreCounts => new CentreActions.GetCentreCountsSuccess({ centreCounts })),
          catchError(error => observableOf(new CentreActions.GetCentreCountsFailure({ error }))))
    )
  );

}
