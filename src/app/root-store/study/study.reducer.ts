import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Study } from './study.model';
import { StudyActions, StudyActionTypes } from './study.actions';

export interface State extends EntityState<Study> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Study> = createEntityAdapter<Study>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: StudyActions): State {
  switch (action.type) {
    case StudyActionTypes.AddStudyRequest: {
      return adapter.addOne(action.payload.study, state);
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
