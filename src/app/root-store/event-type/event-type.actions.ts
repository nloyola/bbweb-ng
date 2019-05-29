import { EventTypeUpdateAttribute } from '@app/core/services';
import { PagedReply, SearchParams } from '@app/domain';
import { CollectedSpecimenDefinitionName, CollectionEventType, CollectedSpecimenDefinition, EventTypeInfo } from '@app/domain/studies';
import { createAction, props, union } from '@ngrx/store';
import { AnnotationType } from '@app/domain/annotations';

export const searchEventTypesRequest = createAction(
  '[EventType] Search Event Types Request',
  props<{
    studySlug: string,
    studyId: string;
    searchParams: SearchParams
  }>()
);

export const searchEventTypesSuccess = createAction(
  '[EventType] Search Event Types Success',
  props<{ pagedReply: PagedReply<CollectionEventType> }>()
);

export const searchEventTypesFailure = createAction(
  '[EventType] Search Event Types Failure',
  props<{ error: any }>()
);

export const searchEventTypeNamesRequest = createAction(
  '[EventType] Search Event Type Names Request',
  props<{
    studyId: string,
    searchParams: SearchParams
  }>()
);

export const searchEventTypeNamesSuccess = createAction(
  '[EventType] Search Event Type Names Success',
  props<{ eventTypeInfo: EventTypeInfo[] }>()
);

export const searchEventTypeNamesFailure = createAction(
  '[EventType] Search Event Type Names Failure',
  props<{ error: any }>()
);

export const getEventTypeRequest = createAction(
  '[EventType] Get Event Type Request',
  props<{ studySlug: string, eventTypeSlug: string }>()
);

export const getEventTypeByIdRequest = createAction(
  '[EventType] Get Event Type By ID Request',
  props<{ studyId: string, eventTypeId: string }>()
);

export const getEventTypeSuccess = createAction(
  '[EventType] Get Event Type Success',
  props<{ eventType: CollectionEventType }>()
);

export const getEventTypeFailure = createAction(
  '[EventType] Get Event Type Failure',
  props<{ error: any }>()
);

export const addEventTypeRequest = createAction(
  '[EventType] Add Event Type Request',
  props<{ eventType: CollectionEventType }>()
);

export const addEventTypeSuccess = createAction(
  '[EventType] Add Event Type Success',
  props<{ eventType: CollectionEventType }>()
);

export const addEventTypeFailure = createAction(
  '[EventType] Add Event Type Failure',
  props<{ error: any }>()
);

export const updateEventTypeRequest = createAction(
  '[EventType] Update Event Type Request',
  props<{
    eventType: CollectionEventType,
    attributeName: EventTypeUpdateAttribute,
    value: string | boolean | AnnotationType | CollectedSpecimenDefinition
  }>()
);

export const updateEventTypeSuccess = createAction(
  '[EventType] Update Event Type Success',
  props<{ eventType: CollectionEventType }>()
);

export const updateEventTypeFailure = createAction(
  '[EventType] Update Event Type Failure',
  props<{ error: any }>()
);

export const removeEventTypeRequest = createAction(
  '[EventType] Remove Event Type Request',
  props<{ eventType: CollectionEventType }>()
);

export const removeEventTypeSuccess = createAction(
  '[EventType] Remove Event Type Success',
  props<{ eventTypeId: string }>()
);

export const removeEventTypeFailure = createAction(
  '[EventType] Remove Event Type Failure',
  props<{ error: any }>()
);

export const getSpecimenDefinitionNamesRequest = createAction(
  '[EventType] Get Specimen Definition Names Request',
  props<{ studySlug: string }>()
);

export const getSpecimenDefinitionNamesSuccess = createAction(
  '[EventType] Get Specimen Definition Names Success',
  props<{
    studySlug: string,
    specimenDefinitionNames: CollectedSpecimenDefinitionName[]
  }>()
);

export const getSpecimenDefinitionNamesFailure = createAction(
  '[EventType] Get Specimen Definition Names Failure',
  props<{ error: any }>()
);

export const clearLastAdded = createAction(
  '[EventType] Clear Last Added'
);

const all = union({
  searchEventTypesRequest,
  searchEventTypesSuccess,
  searchEventTypesFailure,
  searchEventTypeNamesRequest,
  searchEventTypeNamesSuccess,
  searchEventTypeNamesFailure,
  getEventTypeRequest,
  getEventTypeByIdRequest,
  getEventTypeSuccess,
  getEventTypeFailure,
  addEventTypeRequest,
  addEventTypeSuccess,
  addEventTypeFailure,
  updateEventTypeRequest,
  updateEventTypeSuccess,
  updateEventTypeFailure,
  removeEventTypeRequest,
  removeEventTypeSuccess,
  removeEventTypeFailure,
  getSpecimenDefinitionNamesRequest,
  getSpecimenDefinitionNamesSuccess,
  getSpecimenDefinitionNamesFailure,
  clearLastAdded
});

export type EventTypeActionsUnion = typeof all;
