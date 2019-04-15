import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ParticipantActions from './participant.actions';
import { Participant } from '@app/domain/participants';

export interface State extends EntityState<Participant> {
  lastAddedId: string;
  error?: any;
}

export const adapter: EntityAdapter<Participant> = createEntityAdapter<Participant>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  error: null,
});

export function reducer(
  state = initialState,
  action: ParticipantActions.ParticipantActionsUnion
): State {
  switch (action.type) {

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
