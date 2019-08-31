import { Injectable } from '@angular/core';
import { ProcessingTypeService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as PtStoreActions from './processing-type.actions';

@Injectable()
export class ProcessingTypeStoreEffects {
  constructor(
    private actions$: Actions<PtStoreActions.ProcessingTypeActions>,
    private processingTypeService: ProcessingTypeService
  ) {}

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.SearchProcessingTypesRequest),
    map(action => action.payload),
    // delay(2000),
    switchMap(payload =>
      this.processingTypeService.search(payload.studySlug, payload.searchParams).pipe(
        map(pagedReply => new PtStoreActions.SearchProcessingTypesSuccess({ pagedReply })),
        catchError(error => observableOf(new PtStoreActions.SearchProcessingTypesFailure({ error })))
      )
    )
  );

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.GetProcessingTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.get(payload.studySlug, payload.processingTypeSlug).pipe(
        map(processingType => new PtStoreActions.GetProcessingTypeSuccess({ processingType })),
        catchError(error => observableOf(new PtStoreActions.GetProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  getByIdRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.GetProcessingTypeByIdRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.getById(payload.studyId, payload.processingTypeId).pipe(
        map(processingType => new PtStoreActions.GetProcessingTypeSuccess({ processingType })),
        catchError(error => observableOf(new PtStoreActions.GetProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.AddProcessingTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.add(payload.processingType).pipe(
        map(processingType => new PtStoreActions.AddProcessingTypeSuccess({ processingType })),
        catchError(error => observableOf(new PtStoreActions.AddProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.UpdateProcessingTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.update(payload.processingType, payload.attributeName, payload.value).pipe(
        map(processingType => new PtStoreActions.UpdateProcessingTypeSuccess({ processingType })),
        catchError(error => observableOf(new PtStoreActions.UpdateProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  addOrUpdateAnnotationTypeRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService
        .addOrUpdateAnnotationType(payload.processingType, payload.annotationType)
        .pipe(
          // delay(2000),
          map(processingType => new PtStoreActions.UpdateProcessingTypeSuccess({ processingType })),
          catchError(error => observableOf(new PtStoreActions.UpdateProcessingTypeFailure({ error })))
        )
    )
  );

  @Effect()
  removeAnnotationTypeRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.UpdateProcessingTypeRemoveAnnotationTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.removeAnnotationType(payload.processingType, payload.annotationTypeId).pipe(
        // delay(2000),
        map(processingType => new PtStoreActions.UpdateProcessingTypeSuccess({ processingType })),
        catchError(error => observableOf(new PtStoreActions.UpdateProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  removeProcessingTypeRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.RemoveProcessingTypeRequest),
    map(action => action.payload),
    switchMap(payload =>
      this.processingTypeService.removeProcessingType(payload.processingType).pipe(
        // delay(2000),
        map(processingTypeId => new PtStoreActions.RemoveProcessingTypeSuccess({ processingTypeId })),
        catchError(error => observableOf(new PtStoreActions.RemoveProcessingTypeFailure({ error })))
      )
    )
  );

  @Effect()
  specimenDefinitionNamesRequest$: Observable<Action> = this.actions$.pipe(
    ofType(PtStoreActions.ActionTypes.GetSpecimenDefinitionNamesRequest),
    map(action => action.payload),
    // delay(2000),
    switchMap(payload =>
      this.processingTypeService.getSpecimenDefinitionNames(payload.studyId).pipe(
        map(
          reply =>
            new PtStoreActions.GetSpecimenDefinitionNamesSuccess({
              specimenDefinitionNames: reply
            })
        ),
        catchError(error => observableOf(new PtStoreActions.GetSpecimenDefinitionNamesFailure({ error })))
      )
    )
  );
}
