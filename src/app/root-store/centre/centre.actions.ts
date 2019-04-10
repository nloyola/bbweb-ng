import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Location, PagedReply, SearchParams } from '@app/domain';
import { Centre, CentreCounts } from '@app/domain/centres';
import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { CentreUpdateAttribute } from '@app/core/services';

interface CentreUpdateRequestPayload {
  centre: Centre;
  attributeName: CentreUpdateAttribute;
  value: string | Location;
}

export enum ActionTypes {
  GetCentreCountsRequest = '[Centre] Get Centre Count Request',
  GetCentreCountsSuccess = '[Centre] Get Centre Count Success',
  GetCentreCountsFailure = '[Centre] Get Centre Count Failure',

  SearchCentresRequest = '[Centre] Search Centres Request',
  SearchCentresSuccess = '[Centre] Search Centres Success',
  SearchCentresFailure = '[Centres] Search Centres Failure',

  AddCentreRequest = '[Centre] Add Centre Request',
  AddCentreSuccess = '[Centre] Add Centre Success',
  AddCentreFailure = '[Centre] Add Centre Failure',

  GetCentreRequest = '[Centre] Get Centre Request',
  GetCentreSuccess = '[Centre] Get Centre Success',
  GetCentreFailure = '[Centre] Get Centre Failure',

  UpdateCentreRequest = '[Centre] Update Centre Request',
  UpdateCentreSuccess = '[Centre] Update Centre Success',
  UpdateCentreFailure = '[Centre] Update Centre Failure',
}

@ShowSpinner()
export class GetCentreCountsRequest implements Action {
  readonly type = ActionTypes.GetCentreCountsRequest;
}

/* tslint:disable:max-classes-per-file */
@HideSpinner(ActionTypes.GetCentreCountsRequest)
export class GetCentreCountsSuccess implements Action {
  readonly type = ActionTypes.GetCentreCountsSuccess;

  constructor(public payload: { centreCounts: CentreCounts }) { }
}

@HideSpinner(ActionTypes.GetCentreCountsRequest)
export class GetCentreCountsFailure implements Action {
  readonly type = ActionTypes.GetCentreCountsFailure;

  constructor(public payload: { error: any }) { }
}

export class SearchCentresRequest implements Action {
  readonly type = ActionTypes.SearchCentresRequest;

  constructor(public payload: { searchParams: SearchParams }) { }
}

export class SearchCentresSuccess implements Action {
  readonly type = ActionTypes.SearchCentresSuccess;

  constructor(public payload: { pagedReply: PagedReply<Centre> }) { }
}

export class SearchCentresFailure implements Action {
  readonly type = ActionTypes.SearchCentresFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class AddCentreRequest implements Action {
  readonly type = ActionTypes.AddCentreRequest;

  constructor(public payload: { centre: Centre }) { }
}

@HideSpinner(ActionTypes.AddCentreRequest)
export class AddCentreSuccess implements Action {
  readonly type = ActionTypes.AddCentreSuccess;

  constructor(public payload: { centre: Centre }) { }
}

@HideSpinner(ActionTypes.AddCentreRequest)
export class AddCentreFailure implements Action {
  readonly type = ActionTypes.AddCentreFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class GetCentreRequest implements Action {
  readonly type = ActionTypes.GetCentreRequest;

  constructor(public payload: { slug: string }) { }
}

@HideSpinner(ActionTypes.GetCentreRequest)
export class GetCentreSuccess implements Action {
  readonly type = ActionTypes.GetCentreSuccess;

  constructor(public payload: { centre: Centre }) { }
}

@HideSpinner(ActionTypes.GetCentreRequest)
export class GetCentreFailure implements Action {
  readonly type = ActionTypes.GetCentreFailure;

  constructor(public payload: { error: any }) { }
}

@ShowSpinner()
export class UpdateCentreRequest implements Action {
  readonly type = ActionTypes.UpdateCentreRequest;

  constructor(public payload: CentreUpdateRequestPayload) { }
}

@HideSpinner(ActionTypes.UpdateCentreRequest)
export class UpdateCentreSuccess implements Action {
  readonly type = ActionTypes.UpdateCentreSuccess;

  constructor(public payload: { centre: Centre }) { }
}

@HideSpinner(ActionTypes.UpdateCentreRequest)
export class UpdateCentreFailure implements Action {
  readonly type = ActionTypes.UpdateCentreFailure;

  constructor(public payload: { error: any }) { }
}

export type CentreActions =
  GetCentreCountsRequest
  | GetCentreCountsSuccess
  | GetCentreCountsFailure
  | SearchCentresRequest
  | SearchCentresSuccess
  | SearchCentresFailure
  | AddCentreRequest
  | AddCentreSuccess
  | AddCentreFailure
  | GetCentreRequest
  | GetCentreSuccess
  | GetCentreFailure
  | UpdateCentreRequest
  | UpdateCentreSuccess
  | UpdateCentreFailure;
