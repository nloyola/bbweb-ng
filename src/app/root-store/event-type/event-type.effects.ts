import { Injectable } from '@angular/core';
import { EventTypeService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as EventTypeStoreActions from './event-type.actions';

@Injectable()
export class EventTypeStoreEffects {

  constructor(private eventTypeService: EventTypeService, private actions$: Actions) { }

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.SearchEventTypesRequest>(
      EventTypeStoreActions.ActionTypes.SearchEventTypesRequest),
    map(action => action.payload),
    // delay(2000),
    switchMap(
      payload =>
        this.eventTypeService.search(payload.studySlug, payload.searchParams)
        .pipe(
          map(pagedReply => new EventTypeStoreActions.SearchEventTypesSuccess({ pagedReply })),
          catchError(error => observableOf(new EventTypeStoreActions.SearchEventTypesFailure({ error }))))
    )
  );

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.GetEventTypeRequest>(EventTypeStoreActions.ActionTypes.GetEventTypeRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.eventTypeService.get(payload.studySlug, payload.eventTypeSlug)
        .pipe(
          map(eventType => new EventTypeStoreActions.GetEventTypeSuccess({ eventType })),
          catchError(error => observableOf(new EventTypeStoreActions.GetEventTypeFailure({ error }))))
    )
  );

  @Effect()
  getByIdRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.GetEventTypeByIdRequest>(
      EventTypeStoreActions.ActionTypes.GetEventTypeByIdRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.eventTypeService.getById(payload.studyId, payload.eventTypeId)
        .pipe(
          map(eventType => new EventTypeStoreActions.GetEventTypeSuccess({ eventType })),
          catchError(error => observableOf(new EventTypeStoreActions.GetEventTypeFailure({ error }))))
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.AddEventTypeRequest>(EventTypeStoreActions.ActionTypes.AddEventTypeRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.eventTypeService.add(payload.eventType)
        .pipe(
          map(eventType => new EventTypeStoreActions.AddEventTypeSuccess({ eventType })),
          catchError(error => observableOf(new EventTypeStoreActions.AddEventTypeFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.UpdateEventTypeRequest>(
      EventTypeStoreActions.ActionTypes.UpdateEventTypeRequest),
    map(action => action.payload),
    switchMap(
      payload =>
        this.eventTypeService.update(payload.eventType, payload.attributeName, payload.value)
        .pipe(
          map(eventType => new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType })),
          catchError(error => observableOf(new EventTypeStoreActions.UpdateEventTypeFailure({ error }))))
    )
  );

  @Effect()
  addOrUpdateAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<EventTypeStoreActions.UpdateEventTypeAddOrUpdateAnnotationTypeRequest>
        (EventTypeStoreActions.ActionTypes.UpdateEventTypeAddOrUpdateAnnotationTypeRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.eventTypeService.addOrUpdateAnnotationType(payload.eventType,
                                                      payload.annotationType)
          .pipe(
            // delay(2000),
            map(eventType => new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType })),
            catchError(error =>
                       observableOf(new EventTypeStoreActions.UpdateEventTypeFailure({ error }))))));

  @Effect()
  removeAnnotationTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<EventTypeStoreActions.UpdateEventTypeRemoveAnnotationTypeRequest>
        (EventTypeStoreActions.ActionTypes.UpdateEventTypeRemoveAnnotationTypeRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.eventTypeService.removeAnnotationType(payload.eventType,
                                                 payload.annotationTypeId)
          .pipe(
            // delay(2000),
            map(eventType => new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType })),
            catchError(error =>
                       observableOf(new EventTypeStoreActions.UpdateEventTypeFailure({ error }))))));

  @Effect()
  addOrUpdateSpecimenDefinitionRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<EventTypeStoreActions.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest>
        (EventTypeStoreActions.ActionTypes.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.eventTypeService.addOrUpdateSpecimenDefinition(payload.eventType,
                                                      payload.specimenDefinition)
          .pipe(
            // delay(2000),
            map(eventType => new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType })),
            catchError(error =>
                       observableOf(new EventTypeStoreActions.UpdateEventTypeFailure({ error }))))));

  @Effect()
  removeSpecimenDefinitionRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<EventTypeStoreActions.UpdateEventTypeRemoveSpecimenDefinitionRequest>
        (EventTypeStoreActions.ActionTypes.UpdateEventTypeRemoveSpecimenDefinitionRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.eventTypeService.removeSpecimenDefinition(payload.eventType,
                                                 payload.specimenDefinitionId)
          .pipe(
            // delay(2000),
            map(eventType => new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType })),
            catchError(error =>
                       observableOf(new EventTypeStoreActions.UpdateEventTypeFailure({ error }))))));

  @Effect()
  removeEventTypeRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType<EventTypeStoreActions.RemoveEventTypeRequest>
        (EventTypeStoreActions.ActionTypes.RemoveEventTypeRequest),
      map(action => action.payload),
      switchMap(
        payload =>
          this.eventTypeService.removeEventType(payload.eventType)
          .pipe(
            // delay(2000),
            map(eventTypeId => new EventTypeStoreActions.RemoveEventTypeSuccess({ eventTypeId })),
            catchError(error => observableOf(new EventTypeStoreActions.RemoveEventTypeFailure({ error }))))));


  @Effect()
  specimenDefinitionNamesRequest$: Observable<Action> = this.actions$.pipe(
    ofType<EventTypeStoreActions.GetSpecimenDefinitionNamesRequest>(
      EventTypeStoreActions.ActionTypes.GetSpecimenDefinitionNamesRequest),
    map(action => action.payload),
    // delay(2000),
    switchMap(
      payload =>
        this.eventTypeService.getSpecimenDefinitionNames(payload.studySlug)
        .pipe(
          map(reply => new EventTypeStoreActions.GetSpecimenDefinitionNamesSuccess({
            specimenDefinitionNames: reply
          })),
          catchError(error => observableOf(
            new EventTypeStoreActions.GetSpecimenDefinitionNamesFailure({ error }))))
    )
  );

}
