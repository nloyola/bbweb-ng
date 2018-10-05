import { Action } from '@ngrx/store';

import { Study, StudyCounts, StudyToAdd } from '@app/domain/studies';
import { PagedReply, SearchParams } from '@app/domain';
import { ShowSpinner, HideSpinner } from '@app/core/decorators';
import { AnnotationType } from '@app/domain/annotations';

interface StudyUpdateRequestPayload {
  study: Study,
  attributeName: string,
  value: string
}

interface StudyAddOrUpdateAnnotationTypeRequestPayload {
  study: Study,
  annotationType: AnnotationType
}

interface StudyRemoveAnnotationTypeRequestPayload {
  study: Study,
  annotationTypeId: string
}

export enum ActionTypes {
  GetStudyCountsRequest = '[Study] Get Study Count Request',
  GetStudyCountsSuccess = '[Study] Get Study Count Success',
  GetStudyCountsFailure = '[Study] Get Study Count Failure',

  SearchStudiesRequest = '[Study] Search Studies Request',
  SearchStudiesSuccess = '[Study] Search Studies Success',
  SearchStudiesFailure = '[Study] Search Studies Failure',

  AddStudyRequest = '[Study] Add Study Request',
  AddStudySuccess = '[Study] Add Study Success',
  AddStudyFailure = '[Study] Add Study Failure',

  UpsertStudy = '[Study] Upsert Study',
  UpdateStudy = '[Study] Update Study',

  GetStudyRequest = '[Study] Get Study Request',
  GetStudySuccess = '[Study] Get Study Success',
  GetStudyFailure = '[Study] Get Study Failure',

  GetEnableAllowedRequest = '[Study] Get Enable Allowed Request',
  GetEnableAllowedSuccess = '[Study] Get Enable Allowed Success',
  GetEnableAllowedFailure = '[Study] Get Enable Allowed Failure',

  UpdateStudyRequest = '[Study] Update Study Request',
  UpdateStudyAddOrUpdateAnnotationTypeRequest = '[Study] Update Study Add or Update Annotation Type Request',
  UpdateStudyRemoveAnnotationTypeRequest = '[Study] Update Study Remove Annotation Type Request',
  UpdateStudySuccess = '[Study] Update Study Success',
  UpdateStudyFailure = '[Study] Update Study Failure',
}

@ShowSpinner()
export class GetStudyCountsRequest implements Action {
  readonly type = ActionTypes.GetStudyCountsRequest;
}

@HideSpinner(ActionTypes.GetStudyCountsRequest)
export class GetStudyCountsSuccess implements Action {
  readonly type = ActionTypes.GetStudyCountsSuccess;

  constructor(public payload: { studyCounts: StudyCounts }) { }
}

@HideSpinner(ActionTypes.GetStudyCountsRequest)
export class GetStudyCountsFailure implements Action {
  readonly type = ActionTypes.GetStudyCountsFailure;

  constructor(public payload: { error: any }) { }
}

export class SearchStudiesRequest implements Action {
  readonly type = ActionTypes.SearchStudiesRequest;

  constructor(public payload: { searchParams: SearchParams }) { }
}

export class SearchStudiesSuccess implements Action {
  readonly type = ActionTypes.SearchStudiesSuccess;

  constructor(public payload: { pagedReply: PagedReply<Study> }) { }
}

export class SearchStudiesFailure implements Action {
  readonly type = ActionTypes.SearchStudiesFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class AddStudyRequest implements Action {
  readonly type = ActionTypes.AddStudyRequest;

  constructor(public payload: { study: StudyToAdd }) { }
}

@HideSpinner(ActionTypes.AddStudyRequest)
export class AddStudySuccess implements Action {
  readonly type = ActionTypes.AddStudySuccess;

  constructor(public payload: { study: Study }) { }
}

@HideSpinner(ActionTypes.AddStudyRequest)
export class AddStudyFailure implements Action {
  readonly type = ActionTypes.AddStudyFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class UpdateStudyRequest implements Action {
  readonly type = ActionTypes.UpdateStudyRequest;

  constructor(public payload: StudyUpdateRequestPayload) { }
}

@ShowSpinner()
export class UpdateStudyAddOrUpdateAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateStudyAddOrUpdateAnnotationTypeRequest;

  constructor(public payload: StudyAddOrUpdateAnnotationTypeRequestPayload) { }
}

@ShowSpinner()
export class UpdateStudyRemoveAnnotationTypeRequest implements Action {
  readonly type = ActionTypes.UpdateStudyRemoveAnnotationTypeRequest;

  constructor(public payload: StudyRemoveAnnotationTypeRequestPayload) { }
}

@HideSpinner(ActionTypes.UpdateStudyRequest)
export class UpdateStudySuccess implements Action {
  readonly type = ActionTypes.UpdateStudySuccess;

  constructor(public payload: { study: Study }) { }
}

@HideSpinner(ActionTypes.UpdateStudyRequest)
export class UpdateStudyFailure implements Action {
  readonly type = ActionTypes.UpdateStudyFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetStudyRequest implements Action {
  readonly type = ActionTypes.GetStudyRequest;

  constructor(public payload: { slug: string }) { }
}

@HideSpinner(ActionTypes.GetStudyRequest)
export class GetStudySuccess implements Action {
  readonly type = ActionTypes.GetStudySuccess;

  constructor(public payload: { study: Study }) { }
}

@HideSpinner(ActionTypes.GetStudyRequest)
export class GetStudyFailure implements Action {
  readonly type = ActionTypes.GetStudyFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetEnableAllowedRequest implements Action {
  readonly type = ActionTypes.GetEnableAllowedRequest;

  constructor(public payload: { studyId: string }) { }
}

@HideSpinner(ActionTypes.GetEnableAllowedRequest)
export class GetEnableAllowedSuccess implements Action {
  readonly type = ActionTypes.GetEnableAllowedSuccess;

  constructor(public payload: { studyId: string, allowed: boolean }) { }
}

@HideSpinner(ActionTypes.GetEnableAllowedRequest)
export class GetEnableAllowedFailure implements Action {
  readonly type = ActionTypes.GetEnableAllowedFailure;

  constructor(public payload: { error: any }) { }
}

export type StudyActions =
  GetStudyCountsRequest
  | GetStudyCountsSuccess
  | GetStudyCountsFailure
  | SearchStudiesRequest
  | SearchStudiesSuccess
  | SearchStudiesFailure
  | AddStudyRequest
  | AddStudySuccess
  | AddStudyFailure
  | GetStudyRequest
  | GetStudySuccess
  | GetStudyFailure
  | GetEnableAllowedRequest
  | GetEnableAllowedSuccess
  | GetEnableAllowedFailure
  | UpdateStudyRequest
  | UpdateStudySuccess
  | UpdateStudyFailure;
