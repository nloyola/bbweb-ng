import { Injectable } from '@angular/core';
import { StudyService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as StudyActions from './study.actions';

@Injectable()
export class StudyStoreEffects {

  constructor(private actions$: Actions<StudyActions.StudyActionsUnion>,
              private studyService: StudyService) { }

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.getStudyRequest.type),
    switchMap(
      action =>
        this.studyService.get(action.slug).pipe(
          map(study => StudyActions.getStudySuccess({ study })),
          catchError(error => observableOf(StudyActions.getStudyFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.searchStudiesRequest.type),
    switchMap(
      action =>
        this.studyService.search(action.searchParams).pipe(
          map(pagedReply => StudyActions.searchStudiesSuccess({ pagedReply })),
          catchError(error => observableOf(StudyActions.searchStudiesFailure({ error }))))
    )
  );

  /**
   * Returns studies that allow specimen collection.
   */
  @Effect()
  searchCollectionStudiesRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.searchCollectionStudiesRequest.type),
    switchMap(
      action =>
        this.studyService.searchCollectionStudies(action.searchParams).pipe(
          map(studiesData => StudyActions.searchCollectionStudiesSuccess({ studiesData })),
          catchError(error => observableOf(StudyActions.searchCollectionStudiesFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.addStudyRequest.type),
    switchMap(
      action =>
        this.studyService.add(action.study)
        .pipe(
          map(study => StudyActions.addStudySuccess({ study })),
          catchError(error => observableOf(StudyActions.addStudyFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.updateStudyRequest.type),
    switchMap(
      action =>
        this.studyService.update(action.study, action.attributeName, action.value)
        .pipe(
          map(study => StudyActions.updateStudySuccess({ study })),
          catchError(error => observableOf(StudyActions.updateStudyFailure({ error }))))
    )
  );

  @Effect()
  addOrUpdateAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType(StudyActions.updateStudyAddOrUpdateAnnotationTypeRequest.type),
      switchMap(
        action =>
          this.studyService.addOrUpdateAnnotationType(action.study, action.annotationType).pipe(
            // delay(2000),
            map(study => StudyActions.updateStudySuccess({ study })),
            catchError(error =>
                       observableOf(StudyActions.updateStudyFailure({ error }))))));

  @Effect()
  removeAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType(StudyActions.updateStudyRemoveAnnotationTypeRequest.type),
      switchMap(
        action =>
          this.studyService.removeAnnotationType(action.study, action.annotationTypeId).pipe(
            // delay(2000),
            map(study => StudyActions.updateStudySuccess({ study })),
            catchError(error =>
                       observableOf(StudyActions.updateStudyFailure({ error }))))));

  @Effect()
  countsRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.getStudyCountsRequest.type),
    switchMap(
      () =>
        this.studyService.counts().pipe(
          // delay(5000),
          map(studyCounts => StudyActions.getStudyCountsSuccess({ studyCounts })),
          catchError(error => observableOf(StudyActions.getStudyCountsFailure({ error }))))
    )
  );

  @Effect()
  enableAllowedRequest$: Observable<Action> = this.actions$.pipe(
    ofType(StudyActions.getEnableAllowedRequest.type),
    switchMap(
      action =>
        this.studyService.enableAllowed(action.studyId).pipe(
          // delay(5000),
          map(value => StudyActions.getEnableAllowedSuccess(value)),
          catchError(error => observableOf(StudyActions.getEnableAllowedFailure({ error }))))
    )
  );

}
