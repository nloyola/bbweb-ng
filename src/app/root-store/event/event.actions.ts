import { CollectionEventUpdateAttribute } from '@app/core/services';
import { PagedReply, SearchParams } from '@app/domain';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { createAction, props, union } from '@ngrx/store';

/**
 * Actions dealing with {@link app.domain.participants.CollectionEvent CollectionEvents}.
 */

export const searchEventsRequest = createAction(
  '[Event] Search Events Request',
  props<{
    participant: Participant,
    searchParams: SearchParams
  }>()
);

export const searchEventsSuccess = createAction(
  '[Event] Search Events Success',
  props<{ pagedReply: PagedReply<CollectionEvent> }>()
);

export const searchEventsFailure = createAction(
  '[Event] Search Events Failure',
  props<{ error: any }>()
);

export const addEventRequest = createAction(
  '[Event] Add Event Request',
  props<{ event: CollectionEvent }>()
);

export const addEventSuccess = createAction(
  '[Event] Add Event Success',
  props<{ event: CollectionEvent }>()
);

export const addEventFailure = createAction(
  '[Event] Add Event Failure',
  props<{ error: any }>()
);

export const getEventRequest = createAction(
  '[Event] Get Event Request',
  props<{
    id?: string
    participant?: Participant,
    visitNumber?: number
  }>()
);

export const getEventSuccess = createAction(
  '[Event] Get Event Success',
  props<{ event: CollectionEvent }>()
);

export const getEventFailure = createAction(
  '[Event] Get Event Failure',
  props<{ error: any }>()
);

export const updateEventRequest = createAction(
  '[Event] Update Event Request',
  props<{
    event: CollectionEvent,
    attributeName: CollectionEventUpdateAttribute,
    value: string | Date
  }>()
);

export const updateEventSuccess = createAction(
  '[Event] Update Event Success',
  props<{ event: CollectionEvent }>()
);

export const updateEventFailure = createAction(
  '[Event] Update Event Failure',
  props<{ error: any }>()
);

export const removeEventRequest = createAction(
  '[Event] Remove Event Request',
  props<{ event: CollectionEvent }>()
);

export const removeEventSuccess = createAction(
  '[Event] Remove Event Success',
  props<{ eventId: string }>()
);

export const removeEventFailure = createAction(
  '[Event] Remove Event Failure',
  props<{ error: any }>()
);

const all = union({
  searchEventsRequest,
  searchEventsSuccess,
  searchEventsFailure,
  addEventRequest,
  addEventSuccess,
  addEventFailure,
  getEventRequest,
  getEventSuccess,
  getEventFailure,
  updateEventRequest,
  updateEventSuccess,
  updateEventFailure,
  removeEventRequest,
  removeEventSuccess,
  removeEventFailure
});
export type EventActionsUnion = typeof all;
