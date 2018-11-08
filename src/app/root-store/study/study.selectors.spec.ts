import { StudyStoreReducer, StudyStoreSelectors } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Study } from '@app/domain/studies';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

describe('study-store selectors', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('selectStudyLastAdded', () => {
    const study = factory.study();
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        lastAddedId: study.id
      }
    };

    expect(StudyStoreSelectors.selectStudyLastAddedId(state)).toBe(study.id);
  });

  it('selectStudySearchActive', () => {
    const study = factory.study();
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        searchActive: true
      }
    };

    expect(StudyStoreSelectors.selectStudySearchActive(state)).toBeTruthy();
  });

  it('selectStudyLastSearch', () => {
    const searchParams = new SearchParams();
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        lastSearch: searchParams
      }
    };

    expect(StudyStoreSelectors.selectStudyLastSearch(state)).toBe(searchParams);
  });

  it('selectStudyLastAdded', () => {
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        error: {
          status: 404,
          error: {
            message: 'error'
          }
        }
      }
    };

    expect(StudyStoreSelectors.selectStudyError(state)).toBeTruthy();
  });

  it('selectStudyCounts', () => {
    const studyCounts = factory.studyCounts();
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        studyCounts
      }
    };

    expect(StudyStoreSelectors.selectStudyCounts(state)).toBe(studyCounts);
  });

  it('selectStudySearchReplies', () => {
    const study = factory.study();
    const searchParams = new SearchParams();
    const pagedReply = factory.pagedReply<Study>([ study ]);
    const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
    searchReplies[pagedReply.searchParams.queryString()] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages,
    };
    const state = {
      study: {
        ...StudyStoreReducer.initialState,
        searchReplies
      }
    };

    expect(StudyStoreSelectors.selectStudySearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllStudies', () => {
    const study = factory.study();
    const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
      selectId: (study: Study) => study.id
    });
    const state = {
      study: adapter.addAll([ study ], StudyStoreReducer.initialState)
    };

    expect(StudyStoreSelectors.selectAllStudies(state)).toEqual([ study ]);
  });

  describe('selectStudySearchRepliesAndEntities', () => {

    it('when search has completed', () => {
      const study = factory.study();
      const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
        selectId: (study: Study) => study.id
      });
      const pagedReply = factory.pagedReply<Study>([ study ]);
      const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
      searchReplies[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        study: adapter.addAll([ study ], {
          ...StudyStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(StudyStoreSelectors.selectStudySearchRepliesAndEntities(state)).toEqual({
        reply: {
          searchParams: pagedReply.searchParams,
          offset: pagedReply.offset,
          total: pagedReply.total,
          maxPages: pagedReply.maxPages,
          entityIds: pagedReply.entities.map(e => e.id)
        },
        studies: [ study ]
      });
    });

    it('when there is no last search', () => {
      const searchParams = new SearchParams();
      const state = {
        study: {
          ...StudyStoreReducer.initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(StudyStoreSelectors.selectStudySearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const study = factory.study();
      const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
        selectId: (study: Study) => study.id
      });
      const pagedReply = factory.pagedReply<Study>([ study ]);
      const state = {
        study: adapter.addAll([ study ], {
          ...StudyStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(StudyStoreSelectors.selectStudySearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectStudyLastAdded', () => {
    const study = factory.study();
    const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
      selectId: (study: Study) => study.id
    });
    const state = {
      study: adapter.addAll([ study ], {
        ...StudyStoreReducer.initialState,
        lastAddedId: study.id
      })
    };

    expect(StudyStoreSelectors.selectStudyLastAdded(state)).toEqual(study);
  });

});
