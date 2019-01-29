import { reducer, initialState } from './event-type.reducer';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { EventTypeStoreActions, EventTypeStoreReducer } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { CollectionEventType } from '@app/domain/studies';

describe('EventType Reducer', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

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
    const action = new EventTypeStoreActions.SearchEventTypesRequest(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...EventTypeStoreReducer.initialState,
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
    const action = new EventTypeStoreActions.SearchEventTypesSuccess(payload);
    const state = EventTypeStoreReducer.reducer(
      {
        ...EventTypeStoreReducer.initialState,
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
    const action = new EventTypeStoreActions.SearchEventTypesFailure(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...EventTypeStoreReducer.initialState,
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
    const action = new EventTypeStoreActions.GetEventTypeSuccess(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

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
    const action = new EventTypeStoreActions.GetEventTypeFailure(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...EventTypeStoreReducer.initialState,
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
    const action = new EventTypeStoreActions.AddEventTypeSuccess(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

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
    const action = new EventTypeStoreActions.AddEventTypeFailure(payload);
    const state = EventTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...EventTypeStoreReducer.initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: payload.error
      }
    });
  });

  describe('for updating an event type', () => {

    let eventType;
    let initialState;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      initialState = {
        ...EventTypeStoreReducer.initialState,
        ids: [ eventType.id ],
        entities: {}
      };
      initialState['entities'][eventType.id] = {};
    });

    it('UpdateEventTypeSuccess', () => {
      const payload = { eventType };
      const action = new EventTypeStoreActions.UpdateEventTypeSuccess(payload);
      const state = EventTypeStoreReducer.reducer(initialState, action);

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
      const action = new EventTypeStoreActions.UpdateEventTypeFailure(payload);
      const state = EventTypeStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });

  describe('for removing an event type', () => {

    let eventType;
    let initialState;

    beforeEach(() => {
      eventType = factory.collectionEventType();
      initialState = {
        ...EventTypeStoreReducer.initialState,
        ids: [ eventType.id ],
        entities: {}
      };
      initialState['entities'][eventType.id] = eventType;
    });

    it('RemoveEventTypeSuccess', () => {
      const payload = { eventTypeId: eventType.id };
      const action = new EventTypeStoreActions.RemoveEventTypeSuccess(payload);
      const state = EventTypeStoreReducer.reducer(initialState, action);

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
      const action = new EventTypeStoreActions.RemoveEventTypeFailure(payload);
      const state = EventTypeStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });
  });
});
