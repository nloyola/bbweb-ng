import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Study, StudyCounts } from '@app/domain/studies';
import { PagedReply, SearchParams } from '@app/domain';
import { ShowSpinner, HideSpinner } from '@app/core/decorators';

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

  constructor(public payload: { study: Study }) { }
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

export class UpsertStudy implements Action {
  readonly type = ActionTypes.UpsertStudy;

  constructor(public payload: { study: Study }) { }
}

export class UpdateStudy implements Action {
  readonly type = ActionTypes.UpdateStudy;

  constructor(public payload: { study: Update<Study> }) { }
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
  | UpsertStudy
  | UpdateStudy
  | GetStudyRequest
  | GetStudySuccess
  | GetStudyFailure;
