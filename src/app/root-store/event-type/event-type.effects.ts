import { Injectable } from '@angular/core';
import { EventTypeService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as EventTypeStoreActions from './event-type.actions';

@Injectable()
export class EventTypeStoreEffects {
  constructor(
    private actions$: Actions<EventTypeStoreActions.EventTypeActionsUnion>,
    private eventTypeService: EventTypeService
  ) {}

  @Effect()
  searchRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.searchEventTypesRequest.type),
    switchMap(action =>
      this.eventTypeService.search(action.studySlug, action.searchParams).pipe(
        map(pagedReply => EventTypeStoreActions.searchEventTypesSuccess({ pagedReply })),
        catchError(error => observableOf(EventTypeStoreActions.searchEventTypesFailure({ error })))
      )
    )
  );

  @Effect()
  searchNamesRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.searchEventTypeNamesRequest.type),
    switchMap(action =>
      this.eventTypeService.searchNames(action.studyId, action.searchParams).pipe(
        map(eventTypeData => EventTypeStoreActions.searchEventTypeNamesSuccess({ eventTypeData })),
        catchError(error => observableOf(EventTypeStoreActions.searchEventTypeNamesFailure({ error })))
      )
    )
  );

  @Effect()
  getRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.getEventTypeRequest.type),
    switchMap(action =>
      this.eventTypeService.get(action.studySlug, action.eventTypeSlug).pipe(
        map(eventType => EventTypeStoreActions.getEventTypeSuccess({ eventType })),
        catchError(error => observableOf(EventTypeStoreActions.getEventTypeFailure({ error })))
      )
    )
  );

  @Effect()
  getByIdRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.getEventTypeByIdRequest.type),
    switchMap(action =>
      this.eventTypeService.getById(action.studyId, action.eventTypeId).pipe(
        map(eventType => EventTypeStoreActions.getEventTypeSuccess({ eventType })),
        catchError(error => observableOf(EventTypeStoreActions.getEventTypeFailure({ error })))
      )
    )
  );

  @Effect()
  addRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.addEventTypeRequest.type),
    switchMap(action =>
      this.eventTypeService.add(action.eventType).pipe(
        map(eventType => EventTypeStoreActions.addEventTypeSuccess({ eventType })),
        catchError(error => observableOf(EventTypeStoreActions.addEventTypeFailure({ error })))
      )
    )
  );

  @Effect()
  updateRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.updateEventTypeRequest.type),
    switchMap(action =>
      this.eventTypeService.update(action.eventType, action.attributeName, action.value).pipe(
        map(eventType => EventTypeStoreActions.updateEventTypeSuccess({ eventType })),
        catchError(error => observableOf(EventTypeStoreActions.updateEventTypeFailure({ error })))
      )
    )
  );

  @Effect()
  removeEventTypeRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.removeEventTypeRequest.type),
    switchMap(action =>
      this.eventTypeService.removeEventType(action.eventType).pipe(
        // delay(2000),
        map(eventTypeId => EventTypeStoreActions.removeEventTypeSuccess({ eventTypeId })),
        catchError(error => observableOf(EventTypeStoreActions.removeEventTypeFailure({ error })))
      )
    )
  );

  @Effect()
  specimenDefinitionNamesRequest$: Observable<Action> = this.actions$.pipe(
    ofType(EventTypeStoreActions.getSpecimenDefinitionNamesRequest.type),
    // delay(2000),
    switchMap(action =>
      this.eventTypeService.getSpecimenDefinitionNames(action.studySlug).pipe(
        map(reply =>
          EventTypeStoreActions.getSpecimenDefinitionNamesSuccess({
            studySlug: action.studySlug,
            specimenDefinitionNames: reply
          })
        ),
        catchError(error => observableOf(EventTypeStoreActions.getSpecimenDefinitionNamesFailure({ error })))
      )
    )
  );
}
