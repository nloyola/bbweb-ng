import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { Factory } from '@test/factory';
import * as CollectionEventActions from './event.actions';
import { initialState, reducer } from './event.reducer';

describe('CollectionEvent Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for collectionEvents', () => {

    it('SearchEventsRequest', () => {
      const participant = new Participant().deserialize(factory.participant());
      const searchParams = new SearchParams();
      const action = CollectionEventActions.searchEventsRequest({ participant, searchParams });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: searchParams,
        searchActive: true
      });
    });

    it('SearchCollectionEventsSuccess', () => {
      const collectionEvent = new CollectionEvent().deserialize(factory.collectionEvent());
      const pagedReply = factory.pagedReply<CollectionEvent>([ collectionEvent ]);
      const action = CollectionEventActions.searchEventsSuccess({ pagedReply });
      const state = reducer(
        {
          ...initialState,
          lastSearch: pagedReply.searchParams
        },
        action);

      const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
      searchReply[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset:       pagedReply.offset,
        total:        pagedReply.total,
        entityIds:    pagedReply.entities.map(e => e.id),
        maxPages:     pagedReply.maxPages
      };

      expect(state.searchReplies).toEqual(searchReply);
      expect(state.searchActive).toBe(false);
      expect(state.ids).toContain(collectionEvent.id);
      expect(state.entities[collectionEvent.id]).toEqual(collectionEvent);
    });

    it('SearchCollectionEventsFailure', () => {
      const error = {
        status: 404,
          error: {
            message: 'simulated error'
          }
      };
      const action = CollectionEventActions.searchEventsFailure({ error });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when getting a collectionEvent', () => {

    let collectionEvent: CollectionEvent;

    beforeEach(() => {
      collectionEvent = new CollectionEvent().deserialize(factory.collectionEvent());
    });

    it('GetCollectionEventRequest', () => {
      const action = CollectionEventActions.getEventRequest({ id: collectionEvent.id });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('GetCollectionEventSuccess', () => {
      const action = CollectionEventActions.getEventSuccess({ event: collectionEvent });
      const state = reducer(undefined, action);

      expect(state.ids).toContain(collectionEvent.id);
      expect(state.entities[collectionEvent.id]).toEqual(collectionEvent);
    });

    it('GetCollectionEventFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CollectionEventActions.getEventFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('when adding a collectionEvent', () => {

    let collectionEvent: CollectionEvent;

    beforeEach(() => {
      collectionEvent = new CollectionEvent().deserialize(factory.collectionEvent());
    });

    it('AddCollectionEventRequest', () => {
      const action = CollectionEventActions.addEventRequest({ event: collectionEvent });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('AddCollectionEventSuccess', () => {
      const action = CollectionEventActions.addEventSuccess({ event: collectionEvent });
      const state = reducer(undefined, action);

      expect(state.lastAddedId).toEqual(collectionEvent.id);
      expect(state.ids).toContain(collectionEvent.id);
      expect(state.entities[collectionEvent.id]).toEqual(collectionEvent);
    });

    it('AddCollectionEventFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CollectionEventActions.addEventFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

  describe('for updating a collectionEvent', () => {

    let collectionEvent: CollectionEvent;
    let testInitialState: any;

    beforeEach(() => {
      collectionEvent = new CollectionEvent().deserialize(factory.collectionEvent());
      testInitialState = {
        ...initialState,
        ids: [ collectionEvent.id ],
        entities: {}
      };
      testInitialState['entities'][collectionEvent.id] = {};
    });

    it('UpdateCollectionEventSuccess', () => {
      const initialAction = CollectionEventActions.getEventSuccess({ event: collectionEvent });
      let state = reducer(initialState, initialAction);

      const  updatedCollectionEvent = new CollectionEvent().deserialize({
        ...collectionEvent as any,
        timePacked: new Date()
      });
      state = reducer(
        state,
        CollectionEventActions.updateEventSuccess({ event: updatedCollectionEvent }));

      expect(state.ids).toContain(collectionEvent.id);
      expect(state.entities[collectionEvent.id]).toEqual(updatedCollectionEvent);
    });

    it('UpdateCollectionEventFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CollectionEventActions.updateEventFailure(payload);
      const state = reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });

  describe('when removing a collectionEvent', () => {

    let collectionEvent: CollectionEvent;

    beforeEach(() => {
      collectionEvent = new CollectionEvent().deserialize(factory.collectionEvent());
    });

    it('removeEventRequest', () => {
      const action = CollectionEventActions.removeEventRequest({ event: collectionEvent });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('removeEventSuccess', () => {
      const testInitialState = {
        ...initialState,
        ids: [ collectionEvent.id ],
        entities: {}
      };
      testInitialState['entities'][collectionEvent.id] = collectionEvent;

      const action = CollectionEventActions.removeEventSuccess({ eventId: collectionEvent.id });
      const state = reducer(testInitialState, action);

      expect(state.ids).not.toContain(collectionEvent.id);
      expect(state.entities[collectionEvent.id]).toBeUndefined();
      expect(state.lastRemovedId).toBe(collectionEvent.id);
    });

    it('removeEventFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CollectionEventActions.removeEventFailure(payload);
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: null,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });

  });

});
