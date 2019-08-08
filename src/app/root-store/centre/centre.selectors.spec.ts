import { PagedReplyEntityIds } from '@app/domain';
import { Centre, CentreLocationInfo } from '@app/domain/centres';
import { CentreStoreReducer, CentreStoreSelectors } from '@app/root-store';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Factory } from '@test/factory';
import { CentreLocationsSearchReply } from '@app/core/services';

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
        searchState: {
          searchActive: true
        }
      }
    };

    expect(CentreStoreSelectors.selectCentreSearchActive(state)).toBeTruthy();
  });

  it('selectCentreLastSearch', () => {
    const searchParams = {};
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        searchState: {
          lastSearch: searchParams
        }
      }
    };

    expect(CentreStoreSelectors.selectCentreLastSearch(state)).toBe(searchParams);
  });

  it('selectCentreSearchReplies', () => {
    const centre = new Centre().deserialize(factory.centre());
    const pagedReply = factory.pagedReply<Centre>([centre]);
    const searchTerm = JSON.stringify(pagedReply.searchParams);
    const replies = {};
    replies[searchTerm] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages
    };
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        searchState: {
          replies
        }
      }
    };

    expect(CentreStoreSelectors.selectCentreSearchReplies(state)).toBe(replies);
  });

  it('selectLocationsSearchActive', () => {
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        locationsSearchState: {
          searchActive: true
        }
      }
    };

    expect(CentreStoreSelectors.selectLocationsSearchActive(state)).toBeTruthy();
  });

  it('selectLocationsLastSearch', () => {
    const searchParams = {};
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        locationsSearchState: {
          lastSearch: searchParams
        }
      }
    };

    expect(CentreStoreSelectors.selectLocationsLastSearch(state)).toBe(searchParams);
  });

  it('selectLocationsSearchReplies', () => {
    const centre = new Centre().deserialize(factory.centre({ locations: [factory.location()] }));
    const centreLocations = [new CentreLocationInfo().deserialize(factory.centreLocationInfo(centre))];
    const filter = factory.stringNext();

    const replies = {};
    replies[filter] = { centreLocations };
    const state = {
      centre: {
        ...CentreStoreReducer.initialState,
        locationsSearchState: {
          replies
        }
      }
    };

    expect(CentreStoreSelectors.selectLocationsSearchReplies(state)).toBe(replies);
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

  it('selectAllCentres', () => {
    const centre = new Centre().deserialize(factory.centre());
    const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
      selectId: (s: Centre) => s.id
    });
    const state = {
      centre: adapter.addAll([centre], CentreStoreReducer.initialState)
    };

    expect(CentreStoreSelectors.selectAllCentres(state)).toEqual([centre]);
  });

  describe('selectCentreSearchRepliesAndEntities', () => {
    it('when search has completed', () => {
      const centre = new Centre().deserialize(factory.centre());
      const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
        selectId: (s: Centre) => s.id
      });
      const pagedReply = factory.pagedReply<Centre>([centre]);
      const searchTerm = JSON.stringify(pagedReply.searchParams);
      const replies = {};
      replies[searchTerm] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        centre: adapter.addAll([centre], {
          ...CentreStoreReducer.initialState,
          searchState: {
            searchActive: false,
            lastSearch: pagedReply.searchParams,
            replies
          }
        })
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toEqual({
        entities: [centre],
        hasNoEntitiesToDisplay: false,
        hasNoResultsToDisplay: false,
        hasResultsToDisplay: true,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages,
        showPagination: false
      });
    });

    it('when there is no last search', () => {
      const state = {
        centre: {
          ...CentreStoreReducer.initialState,
          searchState: {
            searchActive: false,
            lastSearch: null
          }
        }
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const centre = new Centre().deserialize(factory.centre());
      const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
        selectId: (s: Centre) => s.id
      });
      const pagedReply = factory.pagedReply<Centre>([centre]);
      const searchTerm = JSON.stringify(pagedReply.searchParams);
      const state = {
        centre: adapter.addAll([centre], {
          ...CentreStoreReducer.initialState,
          searchState: {
            searchActive: false,
            lastSearch: searchTerm,
            replies: {}
          }
        })
      };

      expect(CentreStoreSelectors.selectCentreSearchRepliesAndEntities(state)).toBeUndefined();
    });
  });

  it('selectCentreLastAdded', () => {
    const centre = new Centre().deserialize(factory.centre());
    const adapter: EntityAdapter<Centre> = createEntityAdapter<Centre>({
      selectId: (s: Centre) => s.id
    });
    const state = {
      centre: adapter.addAll([centre], {
        ...CentreStoreReducer.initialState,
        lastAddedId: centre.id
      })
    };

    expect(CentreStoreSelectors.selectCentreLastAdded(state)).toEqual(centre);
  });
});
