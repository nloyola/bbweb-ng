import { Injectable } from '@angular/core';
import { CollectionEventService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as EventActions from './event.actions';

@Injectable()
export class EventStoreEffects {

  constructor(private actions$: Actions<EventActions.EventActionsUnion>,
              private collectionEventService: CollectionEventService) { }

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(EventActions.getEventRequest.type),
    switchMap(action => {
      if (action.id) {
        return this.collectionEventService.get(action.id).pipe(
          map(event => EventActions.getEventSuccess({ event })),
          catchError(error => observableOf(EventActions.getEventFailure({ error }))));
      } else if (action.participant && action.visitNumber) {
        return this.collectionEventService.getByVisitNumber(action.participant, action.visitNumber).pipe(
          map(event => EventActions.getEventSuccess({ event })),
          catchError(error => observableOf(EventActions.getEventFailure({ error }))));
      } else {
        const error = { message: 'invalid action parameters' };
        return observableOf(EventActions.getEventFailure({ error }));
      }
    }));

  @Effect()
  searchRequest$ = this.actions$.pipe(
    ofType(EventActions.searchEventsRequest.type),
    switchMap(
      action =>
        this.collectionEventService.search(action.participant, action.searchParams).pipe(
          map(pagedReply => EventActions.searchEventsSuccess({ pagedReply })),
          catchError(error => observableOf(EventActions.searchEventsFailure({ error }))))
    )
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(EventActions.addEventRequest.type),
    map(action => action.event),
    switchMap(
      e =>
        this.collectionEventService.add(e).pipe(
          map(event => EventActions.addEventSuccess({ event })),
          catchError(error => observableOf(EventActions.addEventFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$ = this.actions$.pipe(
    ofType(EventActions.updateEventRequest.type),
    switchMap(
      action =>
        this.collectionEventService.update(action.event, action.attributeName, action.value).pipe(
          map(event => EventActions.updateEventSuccess({ event })),
          catchError(error => observableOf(EventActions.updateEventFailure({ error }))))
    )
  );

  @Effect()
  removeEventRequest$: Observable<Action> =
    this.actions$.pipe(
      ofType(EventActions.removeEventRequest.type),
      switchMap(
        action =>
          this.collectionEventService.remove(action.event).pipe(
            // delay(2000),
            map(eventId => EventActions.removeEventSuccess({ eventId })),
            catchError(error => observableOf(EventActions.removeEventFailure({ error }))))));

}
