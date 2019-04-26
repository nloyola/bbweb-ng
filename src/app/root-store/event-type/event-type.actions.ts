import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { PagedReply, SearchParams } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { CollectedSpecimenDefinition, CollectedSpecimenDefinitionName, CollectionEventType } from '@app/domain/studies';
import { Action } from '@ngrx/store';

// TODO: Update to use createAction introduced in NGRX 7.4

interface EventTypesRequestPayload {
  studySlug: string;
  studyId: string;
  searchParams: SearchParams;
}

interface EventTypeUpdateRequestPayload {
  eventType: CollectionEventType;
  attributeName: string;
  value: string | boolean;
}

interface EventTypeAddOrUpdateAnnotationTypeRequestPayload {
  eventType: CollectionEventType;
  annotationType: AnnotationType;
}

interface EventTypeRemoveAnnotationTypeRequestPayload {
  eventType: CollectionEventType;
  annotationTypeId: string;
}

interface EventTypeAddOrUpdateSpecimenDefinitionRequestPayload {
  eventType: CollectionEventType;
  specimenDefinition: CollectedSpecimenDefinition;
}

interface EventTypeRemoveSpecimenDefinitionRequestPayload {
  eventType: CollectionEventType;
  specimenDefinitionId: string;
}

export enum ActionTypes {

  SearchEventTypesRequest = '[EventType] Search Event Types Request',
  SearchEventTypesSuccess = '[EventType] Search Event Types Success',
  SearchEventTypesFailure = '[EventType] Search Event Types Failure',

  GetEventTypeRequest = '[EventType] Get Event Type Request',
  GetEventTypeByIdRequest = '[EventType] Get Event Type By ID Request',
  GetEventTypeSuccess = '[EventType] Get Event Type Success',
  GetEventTypeFailure = '[EventType] Get Event Type Failure',

  AddEventTypeRequest = '[EventType] Add Event Type Request',
  AddEventTypeSuccess = '[EventType] Add Event Type Success',
  AddEventTypeFailure = '[EventType] Add Event Type Failure',

  UpdateEventTypeRequest = '[EventType] Update Event Type Request',
  UpdateEventTypeAddOrUpdateAnnotationTypeRequest =
    '[EventType] Update EventType Add or Update Annotation Type Request',
  UpdateEventTypeRemoveAnnotationTypeRequest =
    '[EventType] Update Event Type Remove Annotation Type Request',
  UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest =
    '[EventType] Update EventType Add or Update Specimen Definition Request',
  UpdateEventTypeRemoveSpecimenDefinitionRequest =
    '[EventType] Update Event Type Remove Specimen Definition Request',
  UpdateEventTypeSuccess = '[EventType] Update Event Type Success',
  UpdateEventTypeFailure = '[EventType] Update Event Type Failure',

  RemoveEventTypeRequest = '[EventType] Remove Event Type Request',
  RemoveEventTypeSuccess = '[EventType] Remove Event Type Success',
  RemoveEventTypeFailure = '[EventType] Remove Event Type Failure',

  GetSpecimenDefinitionNamesRequest = '[EventType] Get Specimen Definition Names Request',
  GetSpecimenDefinitionNamesSuccess = '[EventType] Get Specimen Definition Names Success',
  GetSpecimenDefinitionNamesFailure = '[EventType] Get Specimen Definition Names Failure',

  ClearLastAdded = '[EventType] Clear Last Added'
}

export class SearchEventTypesRequest implements Action {
  readonly type = ActionTypes.SearchEventTypesRequest;

  constructor(public payload: EventTypesRequestPayload) { }
}

/* tslint:disable:max-classes-per-file */
export class SearchEventTypesSuccess implements Action {
  readonly type = ActionTypes.SearchEventTypesSuccess;

  constructor(public payload: { pagedReply: PagedReply<CollectionEventType> }) { }
}

export class SearchEventTypesFailure implements Action {
  readonly type = ActionTypes.SearchEventTypesFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetEventTypeRequest implements Action {
  readonly type = ActionTypes.GetEventTypeRequest;

  constructor(public payload: { studySlug: string, eventTypeSlug: string }) { }
}

export class GetEventTypeByIdRequest implements Action {
  readonly type = ActionTypes.GetEventTypeByIdRequest;

  constructor(public payload: { studyId: string, eventTypeId: string }) { }
}

@HideSpinner(ActionTypes.GetEventTypeRequest)
export class GetEventTypeSuccess implements Action {
  readonly type = ActionTypes.GetEventTypeSuccess;

  constructor(public payload: { eventType: CollectionEventType }) { }
}

@HideSpinner(ActionTypes.GetEventTypeRequest)
export class GetEventTypeFailure implements Action {
  readonly type = ActionTypes.GetEventTypeFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class AddEventTypeRequest implements Action {
  readonly type = ActionTypes.AddEventTypeRequest;

  constructor(public payload: { eventType: CollectionEventType }) { }
}

@HideSpinner(ActionTypes.AddEventTypeRequest)
export class AddEventTypeSuccess implements Action {
  readonly type = ActionTypes.AddEventTypeSuccess;

  constructor(public payload: { eventType: CollectionEventType }) { }
}

@HideSpinner(ActionTypes.AddEventTypeRequest)
export class AddEventTypeFailure implements Action {
  readonly type = ActionTypes.AddEventTypeFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class UpdateEventTypeRequest implements Action {
  readonly type = ActionTypes.UpdateEventTypeRequest;

  constructor(public payload: EventTypeUpdateRequestPayload) { }
}

export class UpdateEventTypeAddOrUpdateAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateEventTypeAddOrUpdateAnnotationTypeRequest;

  constructor(public payload: EventTypeAddOrUpdateAnnotationTypeRequestPayload) { }
}

export class UpdateEventTypeRemoveAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateEventTypeRemoveAnnotationTypeRequest;

  constructor(public payload: EventTypeRemoveAnnotationTypeRequestPayload) { }
}

export class UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest implements Action {
  readonly type = ActionTypes.UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest;

  constructor(public payload: EventTypeAddOrUpdateSpecimenDefinitionRequestPayload) { }
}

export class UpdateEventTypeRemoveSpecimenDefinitionRequest implements Action {
  readonly type = ActionTypes.UpdateEventTypeRemoveSpecimenDefinitionRequest;

  constructor(public payload: EventTypeRemoveSpecimenDefinitionRequestPayload) { }
}

@HideSpinner(ActionTypes.UpdateEventTypeRequest)
export class UpdateEventTypeSuccess implements Action {
  readonly type = ActionTypes.UpdateEventTypeSuccess;

  constructor(public payload: { eventType: CollectionEventType }) { }
}

@HideSpinner(ActionTypes.UpdateEventTypeRequest)
export class UpdateEventTypeFailure implements Action {
  readonly type = ActionTypes.UpdateEventTypeFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class RemoveEventTypeRequest implements Action {
  readonly type = ActionTypes.RemoveEventTypeRequest;

  constructor(public payload: { eventType: CollectionEventType }) { }
}

@HideSpinner(ActionTypes.RemoveEventTypeRequest)
export class RemoveEventTypeSuccess implements Action {
  readonly type = ActionTypes.RemoveEventTypeSuccess;

  constructor(public payload: { eventTypeId: string }) { }
}

@HideSpinner(ActionTypes.RemoveEventTypeRequest)
export class RemoveEventTypeFailure implements Action {
  readonly type = ActionTypes.RemoveEventTypeFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetSpecimenDefinitionNamesRequest implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesRequest;

  constructor(public payload: { studySlug: string }) { }
}

@HideSpinner(ActionTypes.GetSpecimenDefinitionNamesRequest)
export class GetSpecimenDefinitionNamesSuccess implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesSuccess;

  constructor(public payload: {
    studySlug: string,
    specimenDefinitionNames: CollectedSpecimenDefinitionName[]
  }) { }
}

@HideSpinner(ActionTypes.GetSpecimenDefinitionNamesRequest)
export class GetSpecimenDefinitionNamesFailure implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesFailure;

  constructor(public payload: { error: any }) { }
}

export class ClearLastAdded implements Action {
  readonly type = ActionTypes.ClearLastAdded;
}

export type EventTypeActions =
  SearchEventTypesRequest
  | SearchEventTypesSuccess
  | SearchEventTypesFailure
  | GetEventTypeRequest
  | GetEventTypeByIdRequest
  | GetEventTypeSuccess
  | GetEventTypeFailure
  | AddEventTypeRequest
  | AddEventTypeSuccess
  | AddEventTypeFailure
  | UpdateEventTypeRequest
  | UpdateEventTypeAddOrUpdateAnnotationTypeRequest
  | UpdateEventTypeRemoveAnnotationTypeRequest
  | UpdateEventTypeAddOrUpdateSpecimenDefinitionRequest
  | UpdateEventTypeRemoveSpecimenDefinitionRequest
  | UpdateEventTypeSuccess
  | UpdateEventTypeFailure
  | RemoveEventTypeRequest
  | RemoveEventTypeSuccess
  | RemoveEventTypeFailure
  | GetSpecimenDefinitionNamesRequest
  | GetSpecimenDefinitionNamesSuccess
  | GetSpecimenDefinitionNamesFailure
  | ClearLastAdded;
