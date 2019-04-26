import { PagedReply, SearchParams } from '@app/domain';
import { CollectionEvent, Specimen } from '@app/domain/participants';
import { createAction, props, union } from '@ngrx/store';

/**
 * Actions dealing with {@link app.domain.participants.Specimen Specimens}.
 */

export const searchSpecimensRequest = createAction(
  '[Specimen] Search Specimens Request',
  props<{
    event: CollectionEvent,
    searchParams: SearchParams
  }>()
);

export const searchSpecimensSuccess = createAction(
  '[Specimen] Search Specimens Success',
  props<{ pagedReply: PagedReply<Specimen> }>()
);

export const searchSpecimensFailure = createAction(
  '[Specimen] Search Specimens Failure',
  props<{ error: any }>()
);

export const addSpecimensRequest = createAction(
  '[Specimen] Add Specimen Request',
  props<{
    event: CollectionEvent,
    specimens: Specimen[]
  }>()
);

export const addSpecimensSuccess = createAction(
  '[Specimen] Add Specimen Success',
  props<{ event: CollectionEvent }>()
);

export const addSpecimensFailure = createAction(
  '[Specimen] Add Specimen Failure',
  props<{ error: any }>()
);

export const getSpecimenRequest = createAction(
  '[Specimen] Get Specimen Request',
  props<{ id: string }>()
);

export const getSpecimenSuccess = createAction(
  '[Specimen] Get Specimen Success',
  props<{ specimen: Specimen }>()
);

export const getSpecimenFailure = createAction(
  '[Specimen] Get Specimen Failure',
  props<{ error: any }>()
);

export const removeSpecimenRequest = createAction(
  '[Specimen] Remove Specimen Request',
  props<{ specimen: Specimen }>()
);

export const removeSpecimenSuccess = createAction(
  '[Specimen] Remove Specimen Success',
  props<{ specimenId: string }>()
);

export const removeSpecimenFailure = createAction(
  '[Specimen] Remove Specimen Failure',
  props<{ error: any }>()
);

const all = union({
  searchSpecimensRequest,
  searchSpecimensSuccess,
  searchSpecimensFailure,
  addSpecimensRequest,
  addSpecimensSuccess,
  addSpecimensFailure,
  getSpecimenRequest,
  getSpecimenSuccess,
  getSpecimenFailure,
  removeSpecimenRequest,
  removeSpecimenSuccess,
  removeSpecimenFailure
});
export type SpecimenActionsUnion = typeof all;
