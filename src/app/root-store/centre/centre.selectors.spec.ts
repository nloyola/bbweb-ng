import { CentreStoreReducer, CentreStoreSelectors } from '@app/root-store';
import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

describe('centre-store selectors', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('selectCentreLastAdded', () => {
    const centre = factory.centre();
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        lastAddedId: centre.id
      }
    };

    expect(CentreStoreSelectors.selectCentreLastAddedId(state)).toBe(centre.id);
  });

  it('selectCentreSearchActive', () => {
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        searchActive: true
      }
    };

    expect(CentreStoreSelectors.selectCentreSearchActive(state)).toBeTruthy();
  });

  it('selectCentreLastSearch', () => {
    const searchParams = new SearchParams();
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        lastSearch: searchParams
      }
    };

    expect(CentreStoreSelectors.selectCentreLastSearch(state)).toBe(searchParams);
  });

  it('selectCentreLastAdded', () => {
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        error: {
          status: 404,
          error: {
            message: 'error'
          }
        }
      }
    };

    expect(CentreStoreSelectors.selectCentreError(state)).toBeTruthy();
  });

  it('selectCentreCounts', () => {
    const centreCounts = factory.centreCounts();
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        centreCounts
      }
    };

    expect(CentreStoreSelectors.selectCentreCounts(state)).toBe(centreCounts);
  });

  it('selectCentreSearchReplies', () => {
    const centre = factory.centre();
    const pagedReply = factory.pagedReply<Centre>([ centre ]);
    const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
    searchReplies[pagedReply.searchParams.queryString()] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages,
    };
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        searchReplies
      }
    };

    expect(CentreStoreSelectors.selectCentreSearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllCentres', () => {
    const centre = factory.centre();
    const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
      selectId: (s: Centre) => s.id
    });
    const state = {
      centre: adapter.addAll([ centre ], CentreStoreReducer.initialState)
    };

    expect(CentreStoreSelectors.selectAllCentres(state)).toEqual([ centre ]);
  });

  describe('selectCentreSearchRepliesAndEntities', () => {

    it('when search has completed', () => {
      const centre = factory.centre();
      const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
        selectId: (s: Centre) => s.id
      });
      const pagedReply = factory.pagedReply<Centre>([ centre ]);
      const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
      searchReplies[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        centre: adapter.addAll([ centre ], {
          ...CentreStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toEqual({
        reply: {
          searchParams: pagedReply.searchParams,
          offset: pagedReply.offset,
          total: pagedReply.total,
          maxPages: pagedReply.maxPages,
          entityIds: pagedReply.entities.map(e => e.id)
        },
        centres: [ centre ]
      });
    });

    it('when there is no last search', () => {
      const state = {
        centre: {
          ...CentreStoreReducer.initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const centre = factory.centre();
      const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
        selectId: (s: Centre) => s.id
      });
      const pagedReply = factory.pagedReply<Centre>([ centre ]);
      const state = {
        centre: adapter.addAll([ centre ], {
          ...CentreStoreReducer.initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectCentreLastAdded', () => {
    const centre = factory.centre();
    const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
      selectId: (s: Centre) => s.id
    });
    const state = {
      centre: adapter.addAll([ centre ], {
        ...CentreStoreReducer.initialState,
        lastAddedId: centre.id
      })
    };

    expect(CentreStoreSelectors.selectCentreLastAdded(state)).toEqual(centre);
  });

});
