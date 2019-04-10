import { CentreStoreActions, CentreStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Centre } from '@app/domain/centres';

describe('Centre Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = CentreStoreReducer.reducer(CentreStoreReducer.initialState, action);
      expect(result).toEqual(CentreStoreReducer.initialState);
    });
  });

  it('GetCentreCountsRequest', () => {
    const action = new CentreStoreActions.GetCentreCountsRequest();
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState
    });
  });

  it('GetCentreCountsSuccess', () => {
    const centreCounts = factory.centreCounts();
    const action = new CentreStoreActions.GetCentreCountsSuccess({ centreCounts });
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
    const action = new CentreStoreActions.GetCentreCountsFailure(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
      error: {
        actionType: action.type,
        error: action.payload.error
      }
    });
  });

  it('SearchCentresRequest', () => {
    const payload = {
      searchParams: new SearchParams()
    };
    const action = new CentreStoreActions.SearchCentresRequest(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
      lastSearch: payload.searchParams,
      searchActive: true
    });
  });

  it('SearchCentresSuccess', () => {
    const centre = factory.centre();
    const payload = {
      pagedReply: factory.pagedReply<Centre>([ centre ])
    };
    const action = new CentreStoreActions.SearchCentresSuccess(payload);
    const state = CentreStoreReducer.reducer(
      {
        ...CentreStoreReducer.initialState,
        lastSearch: payload.pagedReply.searchParams
      },
      action);

    const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
    searchReply[payload.pagedReply.searchParams.queryString()] = {
      searchParams: payload.pagedReply.searchParams,
      offset: payload.pagedReply.offset,
      total: payload.pagedReply.total,
      entityIds: payload.pagedReply.entities.map(e => e.id),
      maxPages: payload.pagedReply.maxPages
    };

    expect(state.searchReplies).toEqual(searchReply);
    expect(state.searchActive).toBe(false);
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
    const action = new CentreStoreActions.SearchCentresFailure(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
      lastSearch: null,
      error: {
        type: action.type,
        error: action.payload.error
      }
    });
  });

  it('AddCentreRequest', () => {
    const centre = factory.centre();
    const payload = { centre };
    const action = new CentreStoreActions.AddCentreRequest(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
    });
  });

  it('AddCentreSuccess', () => {
    const centre = factory.centre();
    const payload = { centre };
    const action = new CentreStoreActions.AddCentreSuccess(payload);
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
    const action = new CentreStoreActions.AddCentreFailure(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: action.payload.error
      }
    });
  });

  it('GetCentreRequest', () => {
    const centre = factory.centre();
    const payload = { slug: centre.slug };
    const action = new CentreStoreActions.GetCentreRequest(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
    });
  });

  it('GetCentreSuccess', () => {
    const centre = factory.centre();
    const payload = { centre };
    const action = new CentreStoreActions.GetCentreSuccess(payload);
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
    const action = new CentreStoreActions.GetCentreFailure(payload);
    const state = CentreStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...CentreStoreReducer.initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: action.payload.error
      }
    });
  });

});
