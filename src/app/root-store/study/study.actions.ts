import { PagedReply, SearchParams } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { Study, StudyCounts } from '@app/domain/studies';
import { createAction, props, union } from '@ngrx/store';

export const getStudyCountsRequest = createAction(
  '[Study] Get Study Count Request'
);

export const getStudyCountsSuccess = createAction(
  '[Study] Get Study Count Success',
  props<{ studyCounts: StudyCounts }>()
);

export const getStudyCountsFailure = createAction(
  '[Study] Get Study Count Failure',
  props<{ error: any }>()
);

export const searchStudiesRequest = createAction(
  '[Study] Search Studies Request',
  props<{ searchParams: SearchParams }>()
);

export const searchStudiesSuccess = createAction(
  '[Study] Search Studies Success',
  props<{ pagedReply: PagedReply<Study> }>()
);

export const searchStudiesFailure = createAction(
  '[Study] Search Studies Failure',
  props<{ error: any }>()
);

export const addStudyRequest = createAction(
  '[Study] Add Study Request',
  props<{ study: Study }>()
);

export const addStudySuccess = createAction(
  '[Study] Add Study Success',
  props<{ study: Study }>()
);

export const addStudyFailure = createAction(
  '[Study] Add Study Failure',
  props<{ error: any }>()
);

export const updateStudyRequest = createAction(
  '[Study] Update Study Request',
  props<{
    study: Study,
    attributeName: string,
    value: string
  }>()
);

export const updateStudyAddOrUpdateAnnotationTypeRequest = createAction(
  '[Study] Update Study Add or Update Annotation Type Request',
  props<{
    study: Study,
    annotationType: AnnotationType
  }>()
);

export const updateStudyRemoveAnnotationTypeRequest = createAction(
  '[Study] Update Study Remove Annotation Type Request',
  props<{
    study: Study,
    annotationTypeId: string
  }>()
);

export const updateStudySuccess = createAction(
  '[Study] Update Study Success',
  props<{ study: Study }>()
);

export const updateStudyFailure = createAction(
  '[Study] Update Study Failure',
  props<{ error: any }>()
);

export const getStudyRequest = createAction(
  '[Study] Get Study Request',
  props<{ slug: string }>()
);

export const getStudySuccess = createAction(
  '[Study] Get Study Success',
  props<{ study: Study }>()
);

export const getStudyFailure = createAction(
  '[Study] Get Study Failure',
  props<{ error: any }>()
);

export const getEnableAllowedRequest = createAction(
  '[Study] Get Enable Allowed Request',
  props<{ studyId: string }>()
);

export const getEnableAllowedSuccess = createAction(
  '[Study] Get Enable Allowed Success',
  props<{
    studyId: string,
    allowed: boolean
  }>()
);

export const getEnableAllowedFailure = createAction(
  '[Study] Get Enable Allowed Failure',
  props<{ error: any }>()
);

const all = union({
  getStudyCountsRequest,
  getStudyCountsSuccess,
  getStudyCountsFailure,
  searchStudiesRequest,
  searchStudiesSuccess,
  searchStudiesFailure,
  addStudyRequest,
  addStudySuccess,
  addStudyFailure,
  getStudyRequest,
  getStudySuccess,
  getStudyFailure,
  getEnableAllowedRequest,
  getEnableAllowedSuccess,
  getEnableAllowedFailure,
  updateStudyRequest,
  updateStudyAddOrUpdateAnnotationTypeRequest,
  updateStudyRemoveAnnotationTypeRequest,
  updateStudySuccess,
  updateStudyFailure
});
export type StudyActionsUnion = typeof all;
