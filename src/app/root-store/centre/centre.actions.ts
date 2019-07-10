import { HideSpinner, ShowSpinner } from '@app/core/decorators';
import { Location, PagedReply, SearchParams } from '@app/domain';
import { Centre, CentreCounts } from '@app/domain/centres';
import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { CentreUpdateAttribute } from '@app/core/services';
import { props, createAction, union } from '@ngrx/store';

export const getCentreCountsRequest = createAction(
  '[Centre] Get Centre Count Request',
  props<{ searchParams: SearchParams }>()
);

export const getCentreCountsSuccess = createAction(
  '[Centre] Get Centre Count Success',
  props<{ centreCounts: CentreCounts }>()
);

export const getCentreCountsFailure = createAction(
  '[Centre] Get Centre Count Failure',
  props<{ error: any }>()
);

export const searchCentresRequest = createAction(
  '[Centre] Search Centres Request',
  props<{ searchParams: SearchParams }>()
);

export const searchCentresSuccess = createAction(
  '[Centre] Search Centres Success',
  props<{ pagedReply: PagedReply<Centre> }>()
);

export const searchCentresFailure = createAction(
  '[Centre] Search Centres Failure',
  props<{ error: any }>()
);

export const addCentreRequest = createAction(
  '[Centre] Add Centre Request',
  props<{ centre: Centre }>()
);

export const addCentreSuccess = createAction(
  '[Centre] Add Centre Success',
  props<{ centre: Centre }>()
);

export const addCentreFailure = createAction(
  '[Centre] Add Centre Failure',
  props<{ error: any }>()
);

export const getCentreRequest = createAction(
  '[Centre] Get Centre Request',
  props<{ slug: string }>()
);

export const getCentreSuccess = createAction(
  '[Centre] Get Centre Success',
  props<{ centre: Centre }>()
);

export const getCentreFailure = createAction(
  '[Centre] Get Centre Failure',
  props<{ error: any }>()
);

export const updateCentreRequest = createAction(
  '[Centre] Update Centre Request',
  props<{
    centre: Centre;
    attributeName: CentreUpdateAttribute;
    value: string | Location;
   }>()
);

export const updateCentreSuccess = createAction(
  '[Centre] Update Centre Success',
  props<{ centre: Centre  }>()
);

export const updateCentreFailure = createAction(
  '[Centre] Update Centre Failure',
  props<{ error: any  }>()
);

const all = union({
  getCentreCountsRequest,
  getCentreCountsSuccess,
  getCentreCountsFailure,
  searchCentresRequest,
  searchCentresSuccess,
  searchCentresFailure,
  addCentreRequest,
  addCentreSuccess,
  addCentreFailure,
  getCentreRequest,
  getCentreSuccess,
  getCentreFailure,
  updateCentreRequest,
  updateCentreSuccess,
  updateCentreFailure
});

export type CentreActionsUnion = typeof all;
