import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { StudyService } from '@app/core/services';
import * as StudyActions from './study.actions';
import { Study } from '@app/domain/studies';

@Injectable()
export class StudyStoreEffects {

  constructor(private studyService: StudyService, private actions$: Actions) { }

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.AddStudyRequest>(StudyActions.ActionTypes.AddStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.add(payload.study)
        .pipe(
          map(study => new StudyActions.AddStudySuccess({ study })),
          catchError(error => observableOf(new StudyActions.AddStudyFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.SearchStudiesRequest>(
      StudyActions.ActionTypes.SearchStudiesRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.search(payload.searchParams)
        .pipe(
          map(pagedReply => new StudyActions.SearchStudiesSuccess({ pagedReply })),
          catchError(error => observableOf(new StudyActions.AddStudyFailure({ error }))))
    )
  );

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.GetStudyCountsRequest>(
      StudyActions.ActionTypes.GetStudyCountsRequest),
    switchMap(
      payload =>
        this.studyService.counts()
        .pipe(
          map(studyCounts => new StudyActions.GetStudyCountsSuccess({ studyCounts })),
          catchError(error => observableOf(new StudyActions.GetStudyCountsFailure({ error }))))
    )
  );

}
