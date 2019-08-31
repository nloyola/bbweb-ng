import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ParticipantService } from '@app/core/services';
import { Participant } from '@app/domain/participants';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as ParticipantActions from './participant.actions';
import { ParticipantStoreEffects } from './participant.effects';

describe('participant-store effects', () => {
  let effects: ParticipantStoreEffects;
  let actions: Observable<any>;
  let participantService: ParticipantService;
  const factory = new Factory();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParticipantStoreEffects, provideMockActions(() => actions)]
    });

    effects = TestBed.get(ParticipantStoreEffects);
    participantService = TestBed.get(ParticipantService);
  });

  describe('addParticipantRequestEffect', () => {
    it('should respond with success', () => {
      const participant = new Participant().deserialize(factory.participant());
      const action = ParticipantActions.addParticipantRequest({ participant });
      const completion = ParticipantActions.addParticipantSuccess({ participant });
      spyOn(participantService, 'add').and.returnValue(of(participant));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const participant = new Participant().deserialize(factory.participant());
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = ParticipantActions.addParticipantRequest({ participant });
      const completion = ParticipantActions.addParticipantFailure({ error });
      spyOn(participantService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getParticipantRequestEffect', () => {
    describe('when using participant slug', () => {
      it('should respond with success', () => {
        const participant = new Participant().deserialize(factory.participant());
        const action = ParticipantActions.getParticipantRequest({ slug: participant.slug });
        const completion = ParticipantActions.getParticipantSuccess({ participant });
        spyOn(participantService, 'get').and.returnValue(of(participant));

        actions = hot('--a-', { a: action });
        const expected = cold('--b', { b: completion });

        expect(effects.getRequest$).toBeObservable(expected);
      });

      it('should respond with failure', () => {
        const participant = new Participant().deserialize(factory.participant());
        const error = {
          status: 404,
          error: {
            message: 'simulated error'
          }
        };
        const action = ParticipantActions.getParticipantRequest({ slug: participant.slug });
        const completion = ParticipantActions.getParticipantFailure({ error });
        spyOn(participantService, 'get').and.returnValue(throwError(error));

        actions = hot('--a-', { a: action });
        const expected = cold('--b', { b: completion });

        expect(effects.getRequest$).toBeObservable(expected);
      });
    });

    describe('when using participant uniqueId', () => {
      it('should respond with success', () => {
        const study = factory.study();
        const participant = new Participant().deserialize(factory.participant());
        const action = ParticipantActions.getParticipantRequest({ uniqueId: participant.uniqueId });
        const completion = ParticipantActions.getParticipantSuccess({ participant });
        spyOn(participantService, 'getByUniqueId').and.returnValue(of(participant));

        actions = hot('--a-', { a: action });
        const expected = cold('--b', { b: completion });

        expect(effects.getRequest$).toBeObservable(expected);
      });

      it('should respond with failure', () => {
        const study = factory.study();
        const participant = factory.participant();
        const error = {
          status: 404,
          error: {
            message: 'simulated error'
          }
        };
        const action = ParticipantActions.getParticipantRequest({ uniqueId: participant.uniqueId });
        const completion = ParticipantActions.getParticipantFailure({ error });
        spyOn(participantService, 'getByUniqueId').and.returnValue(throwError(error));

        actions = hot('--a-', { a: action });
        const expected = cold('--b', { b: completion });

        expect(effects.getRequest$).toBeObservable(expected);
      });
    });

    it('throws error when invalid parameters are used', () => {
      const error = { message: 'invalid action parameters' };
      const action = ParticipantActions.getParticipantRequest({});
      const completion = ParticipantActions.getParticipantFailure({ error });

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {
    let participant: Participant;
    let action: Action;
    let participantListener: any;

    beforeEach(() => {
      participant = new Participant().deserialize(factory.participant());
      action = ParticipantActions.updateParticipantRequest({
        participant,
        attributeName: 'uniqueId',
        value: factory.stringNext()
      });
      participantListener = jest.spyOn(participantService, 'update');
    });

    it('should respond with success', () => {
      const completion = ParticipantActions.updateParticipantSuccess({ participant });

      participantListener.mockReturnValue(of(participant));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = ParticipantActions.updateParticipantFailure({ error });

      participantListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });
});
