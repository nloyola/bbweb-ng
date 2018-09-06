import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Study } from '@app/domain/studies';

export enum StudyActionTypes {
  LoadStudies = '[Study] Load Studies',
  AddStudyRequest = '[Study] Add Study Request',
  AddStudySuccess = '[Study] Add Study Success',
  AddStudyFailure = '[Study] Add Study Failure',
  UpsertStudy = '[Study] Upsert Study',
  UpdateStudy = '[Study] Update Study',
  DeleteStudy = '[Study] Delete Study'
}

export class LoadStudies implements Action {
  readonly type = StudyActionTypes.LoadStudies;

  constructor(public payload: { studies: Study[] }) { }
}

export class AddStudyRequest implements Action {
  readonly type = StudyActionTypes.AddStudyRequest;

  constructor(public payload: { study: Study }) { }
}

export class AddStudySuccess implements Action {
  readonly type = StudyActionTypes.AddStudySuccess;

  constructor(public payload: { study: Study }) { }
}

export class AddStudyFailure implements Action {
  readonly type = StudyActionTypes.AddStudyFailure;

  constructor(public payload: { error: any }) { }
}

export class UpsertStudy implements Action {
  readonly type = StudyActionTypes.UpsertStudy;

  constructor(public payload: { study: Study }) { }
}

export class UpdateStudy implements Action {
  readonly type = StudyActionTypes.UpdateStudy;

  constructor(public payload: { study: Update<Study> }) { }
}

export class DeleteStudy implements Action {
  readonly type = StudyActionTypes.DeleteStudy;

  constructor(public payload: { id: string }) { }
}

export type StudyActions =
  LoadStudies
  | AddStudyRequest
  | AddStudySuccess
  | AddStudyFailure
  | UpsertStudy
  | UpdateStudy
  | DeleteStudy;
