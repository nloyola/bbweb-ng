import { StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Study } from '@app/domain/studies';

describe('Study Reducer', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = StudyStoreReducer.reducer(StudyStoreReducer.initialState, action);
      expect(result).toBe(StudyStoreReducer.initialState);
    });
  });

  it('GetStudyCountsRequest', () => {
    const action = new StudyStoreActions.GetStudyCountsRequest();
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState
    });
  });

  it('GetStudyCountsSuccess', () => {
    const studyCounts = factory.studyCounts();
    const action = new StudyStoreActions.GetStudyCountsSuccess({ studyCounts });
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      studyCounts
    });
  });

  it('GetStudyCountsFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.GetStudyCountsFailure(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      error: {
        actionType: action.type,
        error: action.payload.error
      }
    });
  });

  it('SearchStudiesRequest', () => {
    const payload = {
      searchParams: new SearchParams()
    };
    const action = new StudyStoreActions.SearchStudiesRequest(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      lastSearch: payload.searchParams,
      searchActive: true
    });
  });

  it('SearchStudiesSuccess', () => {
    const study = factory.study();
    const payload = {
      pagedReply: factory.pagedReply<Study>([ study ])
    };
    const action = new StudyStoreActions.SearchStudiesSuccess(payload);
    const state = StudyStoreReducer.reducer(
      {
        ...StudyStoreReducer.initialState,
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
    expect(state.ids).toContain(study.id);
    expect(state.entities[study.id]).toEqual(study);
  });

  it('SearchStudiesFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.SearchStudiesFailure(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      lastSearch: null,
      error: {
        type: action.type,
        error: action.payload.error
      }
    });
  });

  it('AddStudyRequest', () => {
    const study = factory.study();
    const payload = { study };
    const action = new StudyStoreActions.AddStudyRequest(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
    });
  });

  it('AddStudySuccess', () => {
    const study = factory.study();
    const payload = { study };
    const action = new StudyStoreActions.AddStudySuccess(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state.lastAddedId).toEqual(study.id);
    expect(state.ids).toContain(study.id);
    expect(state.entities[study.id]).toEqual(study);
  });

  it('AddStudyFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.AddStudyFailure(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      lastSearch: null,
      error: {
        actionType: action.type,
        error: action.payload.error
      }
    });
  });

  it('GetStudyRequest', () => {
    const study = factory.study();
    const payload = { slug: study.slug };
    const action = new StudyStoreActions.GetStudyRequest(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
    });
  });

  it('GetStudySuccess', () => {
    const study = factory.study();
    const payload = { study };
    const action = new StudyStoreActions.GetStudySuccess(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state.ids).toContain(study.id);
    expect(state.entities[study.id]).toEqual(study);
  });

  it('GetStudyFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.GetStudyFailure(payload);
    const state = StudyStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...StudyStoreReducer.initialState,
      lastSearch: null,
      error: {
        type: action.type,
        error: action.payload.error
      }
    });
  });

});
