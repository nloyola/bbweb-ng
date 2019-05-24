import { Participant } from '@app/domain/participants';
import { Factory } from '@test/factory';
import * as ParticipantActions from './participant.actions';
import { initialState, reducer } from './participant.reducer';

describe('Participant Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when getting a participant', () => {

    let participant: Participant;

    beforeEach(() => {
      participant = new Participant().deserialize(factory.participant());
    });

    it('GetParticipantRequest', () => {
      const action = ParticipantActions.getParticipantRequest({ slug: participant.slug });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('GetParticipantSuccess', () => {
      const action = ParticipantActions.getParticipantSuccess({ participant });
      const state = reducer(undefined, action);

      expect(state.ids).toContain(participant.id);
      expect(state.entities[participant.id]).toEqual(participant);
    });

    it('GetParticipantFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ParticipantActions.getParticipantFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when adding a participant', () => {

    let participant: Participant;

    beforeEach(() => {
      participant = new Participant().deserialize(factory.participant());
    });

    it('AddParticipantRequest', () => {
      const action = ParticipantActions.addParticipantRequest({ participant });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('AddParticipantSuccess', () => {
      const action = ParticipantActions.addParticipantSuccess({ participant });
      const state = reducer(undefined, action);

      expect(state.lastAddedId).toEqual(participant.id);
      expect(state.ids).toContain(participant.id);
      expect(state.entities[participant.id]).toEqual(participant);
    });

    it('AddParticipantFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ParticipantActions.addParticipantFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('for updating a participant', () => {

    let participant: Participant;
    let testInitialState: any;

    beforeEach(() => {
      participant = factory.participant();
      testInitialState = {
        ...initialState,
        ids: [ participant.id ],
        entities: {}
      };
      testInitialState['entities'][participant.id] = {};
    });

    it('UpdateParticipantSuccess', () => {
      const initialAction = ParticipantActions.getParticipantSuccess({ participant });
      let state = reducer(initialState, initialAction);

      const  updatedParticipant = new Participant().deserialize({
        ...participant as any,
        timePacked: new Date()
      });
      state = reducer(
        state,
        ParticipantActions.updateParticipantSuccess({ participant: updatedParticipant }));

      expect(state.ids).toContain(participant.id);
      expect(state.entities[participant.id]).toEqual(updatedParticipant);
    });

    it('UpdateParticipantFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = ParticipantActions.updateParticipantFailure(payload);
      const state = reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });

});
