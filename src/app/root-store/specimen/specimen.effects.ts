import { Injectable } from '@angular/core';
import { SpecimenService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as SpecimenActions from './specimen.actions';

@Injectable()
export class SpecimenStoreEffects {
  constructor(
    private actions$: Actions<SpecimenActions.SpecimenActionsUnion>,
    private specimenService: SpecimenService
  ) {}

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(SpecimenActions.getSpecimenRequest.type),
    map(action => action.id),
    switchMap(id =>
      this.specimenService.get(id).pipe(
        map(specimen => SpecimenActions.getSpecimenSuccess({ specimen })),
        catchError(error => observableOf(SpecimenActions.getSpecimenFailure({ error })))
      )
    )
  );

  @Effect()
  searchRequest$ = this.actions$.pipe(
    ofType(SpecimenActions.searchSpecimensRequest.type),
    switchMap(action =>
      this.specimenService.search(action.event, action.searchParams).pipe(
        map(pagedReply => SpecimenActions.searchSpecimensSuccess({ pagedReply })),
        catchError(error => observableOf(SpecimenActions.searchSpecimensFailure({ error })))
      )
    )
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(SpecimenActions.addSpecimensRequest.type),
    switchMap(action =>
      this.specimenService.add(action.event, action.specimens).pipe(
        map(event => SpecimenActions.addSpecimensSuccess({ event })),
        catchError(error => observableOf(SpecimenActions.addSpecimensFailure({ error })))
      )
    )
  );

  @Effect()
  removeSpecimenRequest$: Observable<Action> = this.actions$.pipe(
    ofType(SpecimenActions.removeSpecimenRequest.type),
    switchMap(action =>
      this.specimenService.remove(action.specimen).pipe(
        // delay(2000),
        map(specimenId => SpecimenActions.removeSpecimenSuccess({ specimenId })),
        catchError(error => observableOf(SpecimenActions.removeSpecimenFailure({ error })))
      )
    )
  );
}
