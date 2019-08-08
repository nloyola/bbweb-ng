import { PagedReplyEntityIds } from '@app/domain';
import { Centre, CentreState, CentreLocationInfo } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { initialState } from './centre.reducer';
import { CentreLocationsSearchReply } from '@app/core/services';

describe('Centre Reducer', () => {
  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = CentreStoreReducer.reducer(CentreStoreReducer.initialState, action);
      expect(result).toEqual(CentreStoreReducer.initialState);
    });
  });

  describe('centre counts', () => {
    it('GetCentreCountsRequest', () => {
      const action = CentreStoreActions.getCentreCountsRequest({ searchParams: {} });
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState
      });
    });

    it('GetCentreCountsSuccess', () => {
      const centreCounts = factory.centreCounts();
      const action = CentreStoreActions.getCentreCountsSuccess({ centreCounts });
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        centreCounts
      });
    });

    it('GetCentreCountsFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.getCentreCountsFailure(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('searching centres', () => {
    it('SearchCentresRequest', () => {
      const payload = {
        searchParams: {}
      };
      const action = CentreStoreActions.searchCentresRequest(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        searchState: {
          lastSearch: payload.searchParams,
          searchActive: true
        }
      });
    });

    it('SearchCentresSuccess', () => {
      const centre = new Centre().deserialize(factory.centre());
      const payload = {
        pagedReply: factory.pagedReply<Centre>([centre])
      };
      const action = CentreStoreActions.searchCentresSuccess(payload);
      const state = CentreStoreReducer.reducer(
        {
          ...CentreStoreReducer.initialState,
          searchState: {
            lastSearch: payload.pagedReply.searchParams
          }
        },
        action
      );

      const searchReply = {};
      searchReply[JSON.stringify(payload.pagedReply.searchParams)] = {
        searchParams: payload.pagedReply.searchParams,
        offset: payload.pagedReply.offset,
        total: payload.pagedReply.total,
        entityIds: payload.pagedReply.entities.map(e => e.id),
        maxPages: payload.pagedReply.maxPages
      };

      expect(state.searchState.replies).toEqual(searchReply);
      expect(state.searchState.searchActive).toBe(false);
      expect(state.ids).toContain(centre.id);
      expect(state.entities[centre.id]).toEqual(centre);
    });

    it('SearchCentresFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.searchCentresFailure(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        searchState: {
          lastSearch: null,
          searchActive: false
        },
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('searching centre locations', () => {
    it('SearchLocationsRequest', () => {
      const filter = factory.stringNext();
      const action = CentreStoreActions.searchLocationsRequest({ filter });
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        locationsSearchState: {
          lastSearch: filter,
          searchActive: true
        }
      });
    });

    it('SearchLocationsSuccess', () => {
      const centre = new Centre().deserialize(factory.centre({ locations: [factory.location()] }));
      const centreLocations = [new CentreLocationInfo().deserialize(factory.centreLocationInfo(centre))];
      const filter = factory.stringNext();
      const searchReply: CentreLocationsSearchReply = { filter, centreLocations };
      const action = CentreStoreActions.searchLocationsSuccess({ searchReply });
      const state = CentreStoreReducer.reducer(
        {
          ...CentreStoreReducer.initialState,
          locationsSearchState: {
            lastSearch: filter
          }
        },
        action
      );

      const reply = {};
      reply[filter] = searchReply.centreLocations;

      expect(state.locationsSearchState.replies).toEqual(reply);
      expect(state.locationsSearchState.searchActive).toBe(false);
    });

    it('SearchLocationsFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.searchLocationsFailure(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        locationsSearchState: {
          lastSearch: null,
          searchActive: false
        },
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('adding a centre', () => {
    it('AddCentreRequest', () => {
      const centre = new Centre().deserialize(factory.centre());
      const payload = { centre };
      const action = CentreStoreActions.addCentreRequest(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState
      });
    });

    it('AddCentreSuccess', () => {
      const centre = new Centre().deserialize(factory.centre());
      const payload = { centre };
      const action = CentreStoreActions.addCentreSuccess(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state.lastAddedId).toEqual(centre.id);
      expect(state.ids).toContain(centre.id);
      expect(state.entities[centre.id]).toEqual(centre);
    });

    it('AddCentreFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.addCentreFailure(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        searchState: {},
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('getting a centre', () => {
    it('GetCentreRequest', () => {
      const centre = factory.centre();
      const payload = { slug: centre.slug };
      const action = CentreStoreActions.getCentreRequest(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState
      });
    });

    it('GetCentreSuccess', () => {
      const centre = new Centre().deserialize(factory.centre());
      const payload = { centre };
      const action = CentreStoreActions.getCentreSuccess(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state.ids).toContain(centre.id);
      expect(state.entities[centre.id]).toEqual(centre);
    });

    it('GetCentreFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.getCentreFailure(payload);
      const state = CentreStoreReducer.reducer(undefined, action);

      expect(state).toEqual({
        ...CentreStoreReducer.initialState,
        searchState: {},
        error: {
          actionType: action.type,
          error: action.error
        }
      });
    });
  });

  describe('for updating a centre', () => {
    let centre: Centre;
    let testInitialState: any;

    beforeEach(() => {
      centre = new Centre().deserialize(factory.centre());
      testInitialState = {
        ...CentreStoreReducer.initialState,
        ids: [centre.id],
        entities: {}
      };
      testInitialState['entities'][centre.id] = {};
    });

    it('UpdateCentreSuccess', () => {
      const payload = { centre };
      const initialAction = CentreStoreActions.getCentreSuccess(payload);
      let state = CentreStoreReducer.reducer(initialState, initialAction);

      const updatedCentre = new Centre().deserialize({
        ...(centre as any),
        state: CentreState.Enabled
      });
      state = CentreStoreReducer.reducer(
        state,
        CentreStoreActions.updateCentreSuccess({ centre: updatedCentre })
      );

      expect(state.ids).toContain(centre.id);
      expect(state.entities[centre.id]).toEqual(updatedCentre);
    });

    it('UpdateCentreFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = CentreStoreActions.updateCentreFailure(payload);
      const state = CentreStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });
  });
});
