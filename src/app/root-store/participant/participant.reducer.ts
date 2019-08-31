import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import * as ParticipantActions from './participant.actions';
import { Participant } from '@app/domain/participants';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';

export interface State extends EntityState<Participant> {
  lastAddedId: string;
  error?: any;
}

export const adapter: EntityAdapter<Participant> = createEntityAdapter<Participant>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  error: null
});

export function reducer(state = initialState, action: ParticipantActions.ParticipantActionsUnion): State {
  switch (action.type) {
    case ParticipantActions.addParticipantRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case ParticipantActions.addParticipantSuccess.type: {
      return adapter.addOne(action.participant, {
        ...state,
        lastAddedId: action.participant.id
      });
    }

    case ParticipantActions.addParticipantFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ParticipantActions.getParticipantRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ParticipantActions.getParticipantSuccess.type: {
      return adapter.upsertOne(action.participant, state);
    }

    case ParticipantActions.getParticipantFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case ParticipantActions.updateParticipantRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case ParticipantActions.updateParticipantSuccess.type: {
      return adapter.updateOne(
        {
          id: action.participant.id,
          changes: action.participant
        },
        state
      );
    }

    case ParticipantActions.updateParticipantFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
