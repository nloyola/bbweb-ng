import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { StudyService } from '@app/core/services';
import * as studyActions from './study.actions';
import { Study } from '@app/domain/studies';

@Injectable()
export class StudyStoreEffects {

  constructor(private studyService: StudyService, private actions$: Actions) { }

  @Effect()
  loginRequest$: Observable<Action> = this.actions$.pipe(
    ofType<studyActions.AddStudyRequest>(studyActions.StudyActionTypes.AddStudyRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.studyService.add(payload.study)
        .pipe(
          map(study => new studyActions.AddStudySuccess({ study })),
          catchError(error => observableOf(new studyActions.AddStudyFailure({ error }))))
    )
  );

}
