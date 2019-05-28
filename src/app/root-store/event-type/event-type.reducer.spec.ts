import { reducer, initialState } from './event-type.reducer';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import { CollectionEventType } from '@app/domain/studies';
import * as EventTypeStoreActions from './event-type.actions';

describe('EventType Reducer', () => {

  let factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  it('SearchEventTypesRequest', () => {
    const studyId = factory.stringNext();
    const payload = {
      studyId,
      studySlug: factory.stringNext(),
      searchParams: new SearchParams()
    };
    const action = EventTypeStoreActions.searchEventTypesRequest(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      lastSearch: {
        studyId,
        params: payload.searchParams
      },
      searchActive: true
    });
  });

  it('SearchEventTypesSuccess', () => {
    const eventType = factory.collectionEventType();
    const payload = {
      studySlug: factory.stringNext(),
      pagedReply: factory.pagedReply<CollectionEventType>([ eventType ])
    };
    const action = EventTypeStoreActions.searchEventTypesSuccess(payload);
    const state = reducer(
      {
        ...initialState,
        lastSearch: {
          studyId: eventType.studyId,
          params: payload.pagedReply.searchParams
        }
      },
      action);

    const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
    searchReply[eventType.studyId] = {} as  any;
    searchReply[eventType.studyId][payload.pagedReply.searchParams.queryString()] = {
      searchParams: payload.pagedReply.searchParams,
      offset: payload.pagedReply.offset,
      total: payload.pagedReply.total,
      entityIds: payload.pagedReply.entities.map(e => e.id),
      maxPages: payload.pagedReply.maxPages
    };

    expect(state.searchReplies).toEqual(searchReply);
    expect(state.searchActive).toBe(false);
    expect(state.ids).toContain(eventType.id);
    expect(state.entities[eventType.id]).toEqual(eventType);
  });

  it('SearchEventTypesFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = EventTypeStoreActions.searchEventTypesFailure(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: payload.error
      }
    });
  });

  it('GetEventTypeSuccess', () => {
    const eventType = factory.collectionEventType();
    const payload = { eventType };
    const action = EventTypeStoreActions.getEventTypeSuccess(payload);
    const state = reducer(undefined, action);

    expect(state.ids).toContain(eventType.id);
    expect(state.entities[eventType.id]).toEqual(eventType);
  });

  it('GetEventTypeFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = EventTypeStoreActions.getEventTypeFailure(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: payload.error
      }
    });
  });

  it('AddEventTypeSuccess', () => {
    const eventType = factory.collectionEventType();
    const payload = { eventType };
    const action = EventTypeStoreActions.addEventTypeSuccess(payload);
    const state = reducer(undefined, action);

    expect(state.ids).toContain(eventType.id);
    expect(state.entities[eventType.id]).toEqual(eventType);
  });

  it('AddEventTypeFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = EventTypeStoreActions.addEventTypeFailure(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: payload.error
      }
    });
  });

  describe('for updating an event type', () => {

    let eventType: CollectionEventType;
    let testInitialState: any;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      testInitialState = {
        ...initialState,
        ids: [ eventType.id ],
        entities: {}
      };
      testInitialState['entities'][eventType.id] = {};
    });

    it('UpdateEventTypeSuccess', () => {
      const payload = { eventType };
      const action = EventTypeStoreActions.updateEventTypeSuccess(payload);
      const state = reducer(testInitialState, action);

      expect(state.ids).toContain(eventType.id);
      expect(state.entities[eventType.id]).toEqual(eventType);
    });

    it('UpdateEventTypeFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = EventTypeStoreActions.updateEventTypeFailure(payload);
      const state = reducer(testInitialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });

  describe('for removing an event type', () => {

    let eventType: CollectionEventType;
    let testInitialState: any;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      testInitialState = {
        ...initialState,
        ids: [ eventType.id ],
        entities: {}
      };
      testInitialState['entities'][eventType.id] = eventType;
    });

    it('RemoveEventTypeSuccess', () => {
      const payload = { eventTypeId: eventType.id };
      const action = EventTypeStoreActions.removeEventTypeSuccess(payload);
      const state = reducer(testInitialState, action);

      expect(state.ids).not.toContain(eventType.id);
      expect(state.entities[eventType.id]).toBeUndefined();
    });

    it('RemoveEventTypeFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = EventTypeStoreActions.removeEventTypeFailure(payload);
      const state = reducer(testInitialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });
  });
});
