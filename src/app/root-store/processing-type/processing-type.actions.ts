import { Action } from '@ngrx/store';
import { PagedReply, SearchParams } from '@app/domain';
import { ShowSpinner, HideSpinner } from '@app/core/decorators';
import { AnnotationType } from '@app/domain/annotations';
import { ProcessingType, OutputSpecimenProcessing, InputSpecimenProcessing } from '@app/domain/studies';
import { ProcessedSpecimenDefinitionName } from '@app/domain/studies/processed-specimen-definition-name.model';

interface SearchProcessingTypesRequestPayload {
  studySlug: string;
  studyId: string;
  searchParams: SearchParams;
}

interface ProcessingTypeGetRequestPayload {
  processingType: ProcessingType;
  attributeName: string;
  value: string | boolean | InputSpecimenProcessing | OutputSpecimenProcessing;
}

interface ProcessingTypeUpdateRequestPayload {
  processingType: ProcessingType;
  attributeName: string;
  value: string | boolean | InputSpecimenProcessing | OutputSpecimenProcessing;
}

interface ProcessingTypeAddOrUpdateAnnotationTypeRequestPayload {
  processingType: ProcessingType;
  annotationType: AnnotationType;
}

interface ProcessingTypeRemoveAnnotationTypeRequestPayload {
  processingType: ProcessingType;
  annotationTypeId: string;
}

// TODO: Update to use createAction introduced in NGRX 7.4

export enum ActionTypes {
  SearchProcessingTypesRequest = '[ProcessingType] Search Processing Types Request',
  SearchProcessingTypesSuccess = '[ProcessingType] Search Processing Types Success',
  SearchProcessingTypesFailure = '[ProcessingType] Search Processing Types Failure',

  GetProcessingTypeRequest = '[ProcessingType] Get Processing Type Request',
  GetProcessingTypeByIdRequest = '[ProcessingType] Get Processing Type By ID Request',
  GetProcessingTypeSuccess = '[ProcessingType] Get Processing Type Success',
  GetProcessingTypeFailure = '[ProcessingType] Get Processing Type Failure',

  AddProcessingTypeRequest = '[ProcessingType] Add Processing Type Request',
  AddProcessingTypeSuccess = '[ProcessingType] Add Processing Type Success',
  AddProcessingTypeFailure = '[ProcessingType] Add Processing Type Failure',

  UpdateProcessingTypeRequest = '[ProcessingType] Update Processing Type Request',
  UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest = '[ProcessingType] Update ProcessingType Add or Update Annotation Type Request',
  UpdateProcessingTypeRemoveAnnotationTypeRequest = '[ProcessingType] Update Processing Type Remove Annotation Type Request',
  UpdateProcessingTypeSuccess = '[ProcessingType] Update Processing Type Success',
  UpdateProcessingTypeFailure = '[ProcessingType] Update Processing Type Failure',

  RemoveProcessingTypeRequest = '[ProcessingType] Remove Processing Type Request',
  RemoveProcessingTypeSuccess = '[ProcessingType] Remove Processing Type Success',
  RemoveProcessingTypeFailure = '[ProcessingType] Remove Processing Type Failure',

  GetSpecimenDefinitionNamesRequest = '[ProcessingType] Get Specimen Definition Names Request',
  GetSpecimenDefinitionNamesSuccess = '[ProcessingType] Get Specimen Definition Names Success',
  GetSpecimenDefinitionNamesFailure = '[ProcessingType] Get Specimen Definition Names Failure',

  ClearLastAdded = '[ProcessingType] Clear Last Added'
}

export class SearchProcessingTypesRequest implements Action {
  readonly type = ActionTypes.SearchProcessingTypesRequest;

  constructor(public payload: SearchProcessingTypesRequestPayload) {}
}

/* tslint:disable:max-classes-per-file */
export class SearchProcessingTypesSuccess implements Action {
  readonly type = ActionTypes.SearchProcessingTypesSuccess;

  constructor(public payload: { pagedReply: PagedReply<ProcessingType> }) {}
}

export class SearchProcessingTypesFailure implements Action {
  readonly type = ActionTypes.SearchProcessingTypesFailure;

  constructor(public payload: { error: any }) {}
}

@ShowSpinner()
export class GetProcessingTypeRequest implements Action {
  readonly type = ActionTypes.GetProcessingTypeRequest;

  constructor(public payload: { studySlug: string; processingTypeSlug: string }) {}
}

export class GetProcessingTypeByIdRequest implements Action {
  readonly type = ActionTypes.GetProcessingTypeByIdRequest;

  constructor(public payload: { studyId: string; processingTypeId: string }) {}
}

@HideSpinner(ActionTypes.GetProcessingTypeRequest)
export class GetProcessingTypeSuccess implements Action {
  readonly type = ActionTypes.GetProcessingTypeSuccess;

  constructor(public payload: { processingType: ProcessingType }) {}
}

@HideSpinner(ActionTypes.GetProcessingTypeRequest)
export class GetProcessingTypeFailure implements Action {
  readonly type = ActionTypes.GetProcessingTypeFailure;

  constructor(public payload: { error: any }) {}
}

@ShowSpinner()
export class AddProcessingTypeRequest implements Action {
  readonly type = ActionTypes.AddProcessingTypeRequest;

  constructor(public payload: { processingType: ProcessingType }) {}
}

@HideSpinner(ActionTypes.AddProcessingTypeRequest)
export class AddProcessingTypeSuccess implements Action {
  readonly type = ActionTypes.AddProcessingTypeSuccess;

  constructor(public payload: { processingType: ProcessingType }) {}
}

@HideSpinner(ActionTypes.AddProcessingTypeRequest)
export class AddProcessingTypeFailure implements Action {
  readonly type = ActionTypes.AddProcessingTypeFailure;

  constructor(public payload: { error: any }) {}
}

@ShowSpinner()
export class UpdateProcessingTypeRequest implements Action {
  readonly type = ActionTypes.UpdateProcessingTypeRequest;

  constructor(public payload: ProcessingTypeUpdateRequestPayload) {}
}

export class UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest;

  constructor(public payload: ProcessingTypeAddOrUpdateAnnotationTypeRequestPayload) {}
}

export class UpdateProcessingTypeRemoveAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateProcessingTypeRemoveAnnotationTypeRequest;

  constructor(public payload: ProcessingTypeRemoveAnnotationTypeRequestPayload) {}
}

@HideSpinner(ActionTypes.UpdateProcessingTypeRequest)
export class UpdateProcessingTypeSuccess implements Action {
  readonly type = ActionTypes.UpdateProcessingTypeSuccess;

  constructor(public payload: { processingType: ProcessingType }) {}
}

@HideSpinner(ActionTypes.UpdateProcessingTypeRequest)
export class UpdateProcessingTypeFailure implements Action {
  readonly type = ActionTypes.UpdateProcessingTypeFailure;

  constructor(public payload: { error: any }) {}
}

@ShowSpinner()
export class RemoveProcessingTypeRequest implements Action {
  readonly type = ActionTypes.RemoveProcessingTypeRequest;

  constructor(public payload: { processingType: ProcessingType }) {}
}

@HideSpinner(ActionTypes.RemoveProcessingTypeRequest)
export class RemoveProcessingTypeSuccess implements Action {
  readonly type = ActionTypes.RemoveProcessingTypeSuccess;

  constructor(public payload: { processingTypeId: string }) {}
}

@HideSpinner(ActionTypes.RemoveProcessingTypeRequest)
export class RemoveProcessingTypeFailure implements Action {
  readonly type = ActionTypes.RemoveProcessingTypeFailure;

  constructor(public payload: { error: any }) {}
}

@ShowSpinner()
export class GetSpecimenDefinitionNamesRequest implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesRequest;

  constructor(public payload: { studyId: string }) {}
}

@HideSpinner(ActionTypes.GetSpecimenDefinitionNamesRequest)
export class GetSpecimenDefinitionNamesSuccess implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesSuccess;

  constructor(public payload: { specimenDefinitionNames: ProcessedSpecimenDefinitionName[] }) {}
}

@HideSpinner(ActionTypes.GetSpecimenDefinitionNamesRequest)
export class GetSpecimenDefinitionNamesFailure implements Action {
  readonly type = ActionTypes.GetSpecimenDefinitionNamesFailure;

  constructor(public payload: { error: any }) {}
}

export class ClearLastAdded implements Action {
  readonly type = ActionTypes.ClearLastAdded;
}

export type ProcessingTypeActions =
  | SearchProcessingTypesRequest
  | SearchProcessingTypesSuccess
  | SearchProcessingTypesFailure
  | GetProcessingTypeRequest
  | GetProcessingTypeByIdRequest
  | GetProcessingTypeSuccess
  | GetProcessingTypeFailure
  | AddProcessingTypeRequest
  | AddProcessingTypeSuccess
  | AddProcessingTypeFailure
  | UpdateProcessingTypeRequest
  | UpdateProcessingTypeAddOrUpdateAnnotationTypeRequest
  | UpdateProcessingTypeRemoveAnnotationTypeRequest
  | UpdateProcessingTypeSuccess
  | UpdateProcessingTypeFailure
  | RemoveProcessingTypeRequest
  | RemoveProcessingTypeSuccess
  | RemoveProcessingTypeFailure
  | GetSpecimenDefinitionNamesRequest
  | GetSpecimenDefinitionNamesSuccess
  | GetSpecimenDefinitionNamesFailure
  | ClearLastAdded;
