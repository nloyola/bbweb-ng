import { reducer, initialState } from './event-type.reducer';
import { SearchParams, PagedReplyEntityIds, EntityIds } from '@app/domain';
import { Factory } from '@test/factory';
import { CollectionEventType, EventTypeInfo } from '@app/domain/studies';
import * as EventTypeStoreActions from './event-type.actions';

describe('EventType Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  describe('searching for collection events', () => {

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
        searchState: {
          ...state.searchState,
          lastSearch: {
            studyId,
            params: payload.searchParams
          },
          searchActive: true
        }
      });
    });

    it('SearchEventTypesSuccess', () => {
      const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
      const payload = {
        studySlug: factory.stringNext(),
        pagedReply: factory.pagedReply<CollectionEventType>([ eventType ])
      };
      const action = EventTypeStoreActions.searchEventTypesSuccess(payload);
      const state = reducer(
        {
          ...initialState,
          searchState: {
            ...initialState.searchState,
            lastSearch: {
              studyId: eventType.studyId,
              params: payload.pagedReply.searchParams
            }
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

      expect(state.searchState.searchReplies).toEqual(searchReply);
      expect(state.searchState.searchActive).toBe(false);
      expect(state.ids).toContain(eventType.id);
      expect(state.entities[eventType.id]).toEqual(eventType);
    });

    it('SearchEventTypesFailure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventTypeStoreActions.searchEventTypesFailure({ error: error });
      const state = reducer(initialState, action);

      expect(state.searchState.lastSearch).toBeNull();
      expect(state.error.actionType).toEqual(action.type);
      expect(state.error.error).toEqual(error);
    });

  });

  describe('searching for collection event names', () => {

    it('SearchEventTypeNamesRequest', () => {
      const studyId = factory.stringNext();
      const searchParams = new SearchParams();
      const action = EventTypeStoreActions.searchEventTypeNamesRequest({
        studyId,
        searchParams
      });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        namesSearchState: {
          ...initialState.namesSearchState,
          lastSearch: {
            studyId,
            params: searchParams
          },
          searchActive: true
        }
      });
    });

    it('SearchEventTypeNamesSuccess', () => {
      const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
      const searchParams = new SearchParams();
      const action = EventTypeStoreActions.searchEventTypeNamesSuccess({
        eventTypeInfo: [ new EventTypeInfo().deserialize(factory.entityToInfo(eventType)) ]
      });
      const state = reducer(
        {
          ...initialState,
          namesSearchState: {
            ...initialState.namesSearchState,
            lastSearch: {
              studyId: eventType.studyId,
              params: searchParams
            }
          }
        },
        action);

      const searchReply: { [ key: string]: EntityIds } = {};
      searchReply[eventType.studyId] = {} as any;
      searchReply[eventType.studyId][searchParams.queryString()] = action.eventTypeInfo.map(e => e.id);

      expect(state.namesSearchState.searchReplies).toEqual(searchReply);
      expect(state.namesSearchState.searchActive).toBe(false);
      expect(state.ids).toContain(eventType.id);
      expect(state.entities[eventType.id]).toEqual(factory.entityToInfo(eventType));
    });

    it('SearchEventTypeNamesFailure', () => {
      const error = {
        status: 404,
        error: {
          message: 'simulated error'
        }
      };
      const action = EventTypeStoreActions.searchEventTypeNamesFailure({ error: error });
      const state = reducer(initialState, action);

      expect(state.namesSearchState.lastSearch).toBeNull();
      expect(state.error.actionType).toEqual(action.type);
      expect(state.error.error).toEqual(error);
    });

  });

  it('GetEventTypeSuccess', () => {
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
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
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
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
      eventType = new CollectionEventType().deserialize(factory.collectionEventType());
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
      eventType = new CollectionEventType().deserialize(factory.collectionEventType());
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
