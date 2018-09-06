import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { Study } from '@app/domain/studies';
import { StudyActions, StudyActionTypes } from './study.actions';

export interface State extends EntityState<Study> {

  isAdding?: boolean;

  error?: any;
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  isAdding: false,
  error: null
});

export function reducer(state = initialState, action: StudyActions): State {
  switch (action.type) {
    case StudyActionTypes.AddStudyRequest: {
      return { ...state, isAdding: true };
    }

    case StudyActionTypes.AddStudySuccess: {
      return adapter.addOne(action.payload.study, { ...state, isAdding: false });
    }

    case StudyActionTypes.AddStudyFailure: {
      return {
        ...state,
        error: action.payload.error,
        isAdding: false
      };
    }

    case StudyActionTypes.UpsertStudy: {
      return adapter.upsertOne(action.payload.study, state);
    }

    case StudyActionTypes.UpdateStudy: {
      return adapter.updateOne(action.payload.study, state);
    }

    case StudyActionTypes.DeleteStudy: {
      return adapter.removeOne(action.payload.id, state);
    }

    case StudyActionTypes.LoadStudies: {
      return adapter.addAll(action.payload.studies, state);
    }

    default: {
      return state;
    }
  }
}

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
