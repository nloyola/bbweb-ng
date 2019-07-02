import { props, createAction, union } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Participant } from '@app/domain/participants';
import { ParticipantUpdateAttribute } from '@app/core/services';

export const searchParticipantsRequest = createAction(
  '[Participant] Search Participant Request',
  props<{ searchParams: SearchParams }>()
);

export const searchParticipantsSuccess = createAction(
  '[Participant] Search Participant Success',
  props<{ pagedReply: PagedReply<Participant> }>()
);

export const searchParticipantsFailure = createAction(
  '[Participant] Search Participant Failure',
  props<{ error: any }>()
);

export const addParticipantRequest = createAction(
  '[Participant] Add Participant Request',
  props<{ participant: Participant }>()
);

export const addParticipantSuccess = createAction(
  '[Participant] Add Participant Success',
  props<{ participant: Participant }>()
);

export const addParticipantFailure = createAction(
  '[Participant] Add Participant Failure',
  props<{ error: any }>()
);

export const getParticipantRequest = createAction(
  '[Participant] Get Participant Request',
  props<{
    slug?: string,
    uniqueId?: string
  }>()
);

export const getParticipantSuccess = createAction(
  '[Participant] Get Participant Success',
  props<{ participant: Participant }>()
);

export const getParticipantFailure = createAction(
  '[Participant] Get Participant Failure',
  props<{ error: any }>()
);

export const updateParticipantRequest = createAction(
  '[Participant] Update Participant Request',
  props<{
    participant: Participant,
    attributeName: ParticipantUpdateAttribute,
    value: string | Date
  }>()
);

export const updateParticipantSuccess = createAction(
  '[Participant] Update Participant Success',
  props<{ participant: Participant }>()
);

export const updateParticipantFailure = createAction(
  '[Participant] Update Participant Failure',
  props<{ error: any }>()
);

const all = union({
  searchParticipantsRequest,
  searchParticipantsSuccess,
  searchParticipantsFailure,
  addParticipantRequest,
  addParticipantSuccess,
  addParticipantFailure,
  getParticipantRequest,
  getParticipantSuccess,
  getParticipantFailure,
  updateParticipantRequest,
  updateParticipantSuccess,
  updateParticipantFailure
});
export type ParticipantActionsUnion = typeof all;
