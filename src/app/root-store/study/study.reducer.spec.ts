import { reducer, initialState } from './study.reducer';
import * as StudyActions from './study.actions';
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
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  it('GetStudyCountsRequest', () => {
    const action = StudyActions.getStudyCountsRequest();
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState
    });
  });

  it('GetStudyCountsSuccess', () => {
    const studyCounts = factory.studyCounts();
    const action = StudyActions.getStudyCountsSuccess({ studyCounts });
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
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
    const action = StudyActions.getStudyCountsFailure(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      error: {
        actionType: action.type,
        error: action.error
      }
    });
  });

  it('SearchStudiesRequest', () => {
    const payload = {
      searchParams: new SearchParams()
    };
    const action = StudyActions.searchStudiesRequest(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
      lastSearch: payload.searchParams,
      searchActive: true
    });
  });

  it('SearchStudiesSuccess', () => {
    const study = factory.study();
    const payload = {
      pagedReply: factory.pagedReply<Study>([ study ])
    };
    const action = StudyActions.searchStudiesSuccess(payload);
    const state = reducer(
      {
        ...initialState,
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
    const action = StudyActions.searchStudiesFailure(payload);
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

  it('AddStudyRequest', () => {
    const study = factory.study();
    const payload = { study };
    const action = StudyActions.addStudyRequest(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
    });
  });

  it('AddStudySuccess', () => {
    const study = factory.study();
    const payload = { study };
    const action = StudyActions.addStudySuccess(payload);
    const state = reducer(undefined, action);

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
    const action = StudyActions.addStudyFailure(payload);
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

  it('GetStudyRequest', () => {
    const study = factory.study();
    const payload = { slug: study.slug };
    const action = StudyActions.getStudyRequest(payload);
    const state = reducer(undefined, action);

    expect(state).toEqual({
      ...initialState,
    });
  });

  it('GetStudySuccess', () => {
    const study = factory.study();
    const payload = { study };
    const action = StudyActions.getStudySuccess(payload);
    const state = reducer(undefined, action);

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
    const action = StudyActions.getStudyFailure(payload);
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
