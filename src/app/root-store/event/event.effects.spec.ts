import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CollectionEventService } from '@app/core/services';
import { SearchParams } from '@app/domain';
import { Specimen, Participant } from '@app/domain/participants';
import { CollectionEvent } from '@app/domain/participants';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold, getTestScheduler, hot, initTestScheduler } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import * as EventActions from './event.actions';
import { EventStoreEffects } from './event.effects';

describe('collectionEvent-store effects', () => {

  let effects: EventStoreEffects;
  let actions: Observable<any>;
  let collectionEventService: CollectionEventService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        EventStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(EventStoreEffects);
    collectionEventService = TestBed.get(CollectionEventService);
    factory = new Factory();
  });

  describe('searchEventsRequestEffect', () => {

    it('should respond with success', () => {
      const participant = new Participant().deserialize(factory.participant());
      const searchParams = new SearchParams();
      const collectionEvent = factory.collectionEvent();
      const pagedReply = factory.pagedReply([ collectionEvent ]);
      const action = EventActions.searchEventsRequest({ participant, searchParams });
      const completion = EventActions.searchEventsSuccess({ pagedReply });
      spyOn(collectionEventService, 'search').and.returnValue(of(pagedReply));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const participant = new Participant().deserialize(factory.participant());
      const searchParams = new SearchParams();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventActions.searchEventsRequest({ participant, searchParams });
      const completion = EventActions.searchEventsFailure({ error });
      spyOn(collectionEventService, 'search').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.searchRequest$).toBeObservable(expected);
    });
  });

  describe('addEventRequestEffect', () => {

    it('should respond with success', () => {
      const event = factory.collectionEvent();
      const action = EventActions.addEventRequest({ event });
      const completion = EventActions.addEventSuccess({ event });
      spyOn(collectionEventService, 'add').and.returnValue(of(event));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const event = factory.collectionEvent();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventActions.addEventRequest({ event });
      const completion = EventActions.addEventFailure({ error });
      spyOn(collectionEventService, 'add').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.addRequest$).toBeObservable(expected);
    });
  });

  describe('getEventRequestEffect', () => {

    it('should respond with success', () => {
      const event = factory.collectionEvent();
      const action = EventActions.getEventRequest({ id: event.id });
      const completion = EventActions.getEventSuccess({ event });
      spyOn(collectionEventService, 'get').and.returnValue(of(event));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });

    it('should respond with failure', () => {
      const collectionEvent = factory.collectionEvent();
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventActions.getEventRequest({ id: collectionEvent.id });
      const completion = EventActions.getEventFailure({ error });
      spyOn(collectionEventService, 'get').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.getRequest$).toBeObservable(expected);
    });
  });

  describe('updateRequestEffect', () => {

    let event: CollectionEvent;
    let action: Action;
    let collectionEventListener: any;

    beforeEach(() => {
      event = factory.collectionEvent();
      action = EventActions.updateEventRequest({
        event,
        attributeName: 'timeCompleted',
        value: factory.stringNext()
      });
      collectionEventListener = jest.spyOn(collectionEventService, 'update');
    });

    it('should respond with success', () => {
      const completion = EventActions.updateEventSuccess({ event });

      collectionEventListener.mockReturnValue(of(event));
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
      const completion = EventActions.updateEventFailure({ error });

      collectionEventListener.mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.updateRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

  describe('removeEventRequestEffect', () => {

    let event: CollectionEvent;
    let action: Action;

    beforeEach(() => {
      event = factory.collectionEvent();
      action = EventActions.removeEventRequest({ event });
    });

    it('should respond with success', () => {
      const completion = EventActions.removeEventSuccess({ eventId: event.id });

      jest.spyOn(collectionEventService, 'remove').mockReturnValue(of(event.id));
      actions = hot('--a-', { a: action });
      expect(effects.removeEventRequest$).toBeObservable(cold('--b', { b: completion }));
    });

    it('should respond with failure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const completion = EventActions.removeEventFailure({ error });

      jest.spyOn(collectionEventService, 'remove').mockReturnValue(throwError(error));
      actions = hot('--a-', { a: action });
      expect(effects.removeEventRequest$).toBeObservable(cold('--b', { b: completion }));
    });
  });

});
