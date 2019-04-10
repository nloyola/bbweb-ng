import { reducer, initialState } from './processing-type.reducer';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { ProcessingTypeStoreActions, ProcessingTypeStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
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
    const studyId = factory.stringNext();
    const payload = {
      studyId,
      studySlug: factory.stringNext(),
      searchParams: new SearchParams()
    };
    const action = new ProcessingTypeStoreActions.SearchProcessingTypesRequest(payload);
    const state = ProcessingTypeStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...ProcessingTypeStoreReducer.initialState,
      lastSearch: {
        studyId,
        params: payload.searchParams
      },
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
        lastSearch: {
          studyId: processingType.studyId,
          params: payload.pagedReply.searchParams
        }
      },
      action);

    const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
    searchReply[processingType.studyId] = {} as any;
    searchReply[processingType.studyId][payload.pagedReply.searchParams.queryString()] = {
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
      error: {
        actionType: action.type,
        error: payload.error
      }
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
      error: {
        actionType: action.type,
        error: payload.error
      }
    });
  });

  describe('for adding a processing type', () => {

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
        error: {
          actionType: action.type,
          error: payload.error
        }
      });
    });
  });

  describe('for updating a processing type', () => {

    let processingType: ProcessingType;
    let testInitialState: any;

    beforeEach(() => {
      processingType = factory.processingType();
      testInitialState = {
        ...ProcessingTypeStoreReducer.initialState,
        ids: [ processingType.id ],
        entities: {}
      };
      testInitialState['entities'][processingType.id] = {};
    });

    it('UpdateProcessingTypeSuccess', () => {
      const payload = { processingType };
      const initialAction = new ProcessingTypeStoreActions.GetProcessingTypeSuccess(payload);
      let state = ProcessingTypeStoreReducer.reducer(initialState, initialAction);

      const  updatedPt = new ProcessingType().deserialize({
        ...processingType as any,
        enabled: !processingType.enabled
      });
      state = ProcessingTypeStoreReducer.reducer(
        state,
        new ProcessingTypeStoreActions.UpdateProcessingTypeSuccess({
          processingType: updatedPt
        }));

      expect(state.ids).toContain(processingType.id);
      expect(state.entities[processingType.id]).toEqual(updatedPt);
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
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });

  });

  describe('for removing an processing type', () => {

    let processingType: ProcessingType;
    let testInitialState: any;

    beforeEach(() => {
      processingType = factory.processingType();
      testInitialState = {
        ...ProcessingTypeStoreReducer.initialState,
        ids: [ processingType.id ],
        entities: {}
      };
      testInitialState['entities'][processingType.id] = processingType;
    });

    it('RemoveProcessingTypeSuccess', () => {
      const payload = { processingTypeId: processingType.id };
      const action = new ProcessingTypeStoreActions.RemoveProcessingTypeSuccess(payload);
      const state = ProcessingTypeStoreReducer.reducer(initialState, action);

      expect(state.ids).not.toContain(processingType.id);
      expect(state.entities[processingType.id]).toBeUndefined();
    });

    it('RemoveProcessingTypeFailure', () => {
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
      expect(state.error).toEqual({
        actionType: action.type,
        error: payload.error
      });
    });
  });
});
