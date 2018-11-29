import { reducer, initialState } from './processing-type.reducer';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { ProcessingTypeStoreActions, ProcessingTypeStoreReducer } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { ProcessingType } from '@app/domain/studies';

describe('ProcessingType Reducer', () => {

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

  it('SearchProcessingTypesRequest', () => {
    const payload = {
      studySlug: factory.stringNext(),
      searchParams: new SearchParams()
    };
    const action = new ProcessingTypeStoreActions.SearchProcessingTypesRequest(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...ProcessingTypeStoreReducer.initialState,
      lastSearch: payload.searchParams,
      searchActive: true
    });
  });

  it('SearchProcessingTypesSuccess', () => {
    const processingType = factory.processingType();
    const payload = {
      studySlug: factory.stringNext(),
      pagedReply: factory.pagedReply<ProcessingType>([ processingType ])
    };
    const action = new ProcessingTypeStoreActions.SearchProcessingTypesSuccess(payload);
    const state = ProcessingTypeStoreReducer.reducer(
      {
        ...ProcessingTypeStoreReducer.initialState,
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
    expect(state.ids).toContain(processingType.id);
    expect(state.entities[processingType.id]).toEqual(processingType);
  });

  it('SearchProcessingTypesFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new ProcessingTypeStoreActions.SearchProcessingTypesFailure(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...ProcessingTypeStoreReducer.initialState,
      lastSearch: null,
      error: payload.error
    });
  });

  it('GetProcessingTypeSuccess', () => {
    const processingType = factory.processingType();
    const payload = { processingType };
    const action = new ProcessingTypeStoreActions.GetProcessingTypeSuccess(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state.ids).toContain(processingType.id);
    expect(state.entities[processingType.id]).toEqual(processingType);
  });

  it('GetProcessingTypeFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new ProcessingTypeStoreActions.GetProcessingTypeFailure(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...ProcessingTypeStoreReducer.initialState,
      lastSearch: null,
      error: payload.error
    });
  });

  it('AddProcessingTypeSuccess', () => {
    const processingType = factory.processingType();
    const payload = { processingType };
    const action = new ProcessingTypeStoreActions.AddProcessingTypeSuccess(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state.ids).toContain(processingType.id);
    expect(state.entities[processingType.id]).toEqual(processingType);
  });

  it('AddProcessingTypeFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new ProcessingTypeStoreActions.AddProcessingTypeFailure(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...ProcessingTypeStoreReducer.initialState,
      lastSearch: null,
      error: payload.error
    });
  });

  describe('for updating an processing type', () => {

    let processingType;
    let initialState;

    beforeEach(() => {
      processingType = factory.processingType();
      initialState = {
        ...ProcessingTypeStoreReducer.initialState,
        ids: [ processingType.id ],
        entities: {}
      }
      initialState['entities'][processingType.id] = {};
    });

    it('UpdateProcessingTypeSuccess', () => {
      const payload = { processingType };
      const action = new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess(payload);
      const state = ProcessingTypeStoreReducer.reducer(initialState, action);

      expect(state.ids).toContain(processingType.id);
      expect(state.entities[processingType.id]).toEqual(processingType);
    });

    it('UpdateProcessingTypeFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = new ProcessingTypeStoreActions.UpdateProcessingTypeFailure(payload);
      const state = ProcessingTypeStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual(payload.error);
    });

  });

  describe('for removing an processing type', () => {

    let processingType;
    let initialState;

    beforeEach(() => {
      processingType = factory.processingType();
      initialState = {
        ...ProcessingTypeStoreReducer.initialState,
        ids: [ processingType.id ],
        entities: {}
      }
      initialState['entities'][processingType.id] = processingType;
    });

    it('UpdateProcessingTypeSuccess', () => {
      const payload = { processingTypeId: processingType.id };
      const action = new ProcessingTypeStoreActions.RemoveProcessingTypeSuccess(payload);
      const state = ProcessingTypeStoreReducer.reducer(initialState, action);

      expect(state.ids).not.toContain(processingType.id);
      expect(state.entities[processingType.id]).toBeUndefined();
    });

    it('UpdateProcessingTypeFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = new ProcessingTypeStoreActions.RemoveProcessingTypeFailure(payload);
      const state = ProcessingTypeStoreReducer.reducer(initialState, action);
      expect(state.error).toEqual(payload.error);
    });
  });
});
