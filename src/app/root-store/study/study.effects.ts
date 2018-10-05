import { Injectable } from '@angular/core';
import { StudyService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as StudyActions from './study.actions';

@Injectable()
export class StudyStoreEffects {

  constructor(private studyService: StudyService, private actions$: Actions) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.GetStudyRequest>(StudyActions.ActionTypes.GetStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.get(payload.slug)
        .pipe(
          map(study => new StudyActions.GetStudySuccess({ study })),
          catchError(error => observableOf(new StudyActions.GetStudyFailure({ error }))))
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
          catchError(error => observableOf(new StudyActions.SearchStudiesFailure({ error }))))
    )
  );

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
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.UpdateStudyRequest>(StudyActions.ActionTypes.UpdateStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.update(payload.study, payload.attributeName, payload.value)
        .pipe(
          map(study => new StudyActions.UpdateStudySuccess({ study })),
          catchError(error => observableOf(new StudyActions.UpdateStudyFailure({ error }))))
    )
  );

  @Effect()
  addOrUpdateAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<StudyActions.UpdateStudyAddOrUpdateAnnotationTypeRequest>
        (StudyActions.ActionTypes.UpdateStudyAddOrUpdateAnnotationTypeRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.studyService.addOrUpdateAnnotationType(payload.study,
                                                      payload.annotationType)
          .pipe(
            map(study => new StudyActions.UpdateStudySuccess({ study })),
            catchError(error =>
                       observableOf(new StudyActions.UpdateStudyFailure({ error }))))));

  @Effect()
  removeAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<StudyActions.UpdateStudyRemoveAnnotationTypeRequest>
        (StudyActions.ActionTypes.UpdateStudyRemoveAnnotationTypeRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.studyService.removeAnnotationType(payload.study,
                                                 payload.annotationTypeId)
          .pipe(
            map(study => new StudyActions.UpdateStudySuccess({ study })),
            catchError(error =>
                       observableOf(new StudyActions.UpdateStudyFailure({ error }))))));

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.GetStudyCountsRequest>(
      StudyActions.ActionTypes.GetStudyCountsRequest),
    switchMap(
      () =>
        this.studyService.counts()
        .pipe(
          // delay(5000),
          map(studyCounts => new StudyActions.GetStudyCountsSuccess({ studyCounts })),
          catchError(error => observableOf(new StudyActions.GetStudyCountsFailure({ error }))))
    )
  );

  @Effect()
  enableAllowedRequest$: Observable<Action> = this.actions$.pipe(
    ofType<StudyActions.GetEnableAllowedRequest>(
      StudyActions.ActionTypes.GetEnableAllowedRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.enableAllowed(payload.studyId)
        .pipe(
          // delay(5000),
          map(value => new StudyActions.GetEnableAllowedSuccess(value)),
          catchError(error => observableOf(new StudyActions.GetEnableAllowedFailure({ error }))))
    )
  );

}
