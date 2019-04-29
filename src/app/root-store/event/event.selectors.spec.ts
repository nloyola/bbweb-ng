import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { CollectionEvent } from '@app/domain/participants';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { reducer, initialState } from './event.reducer';
import * as selectors from './event.selectors';

describe('collectionEvent-store selectors', () => {

  const factory = new Factory();

  it('selectCollectionEventLastAdded', () => {
    const collectionEvent = factory.collectionEvent();
    const state = {
      collectionEvent: {
        ...initialState,
        lastAddedId: collectionEvent.id
      }
    };

    expect(selectors.selectCollectionEventLastAddedId(state)).toBe(collectionEvent.id);
  })
;
  it('selectCollectionEventLastRemoved', () => {
    const collectionEvent = factory.collectionEvent();
    const state = {
      collectionEvent: {
        ...initialState,
        lastRemovedId: collectionEvent.id
      }
    };

    expect(selectors.selectCollectionEventLastRemovedId(state)).toBe(collectionEvent.id);
  });

  it('selectCollectionEventSearchActive', () => {
    const state = {
      collectionEvent: {
        ...initialState,
        searchActive: true
      }
    };

    expect(selectors.selectCollectionEventSearchActive(state)).toBeTruthy();
  });

  it('selectCollectionEventLastSearch', () => {
    const searchParams = new SearchParams();
    const state = {
      collectionEvent: {
        ...initialState,
        lastSearch: searchParams
      }
    };

    expect(selectors.selectCollectionEventLastSearch(state)).toBe(searchParams);
  });

  it('selectCollectionEventSearchReplies', () => {
    const collectionEvent = factory.collectionEvent();
    const pagedReply = factory.pagedReply<CollectionEvent>([ collectionEvent ]);
    const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
    searchReplies[pagedReply.searchParams.queryString()] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages,
    };
    const state = {
      collectionEvent: {
        ...initialState,
        searchReplies
      }
    };

    expect(selectors.selectCollectionEventSearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllCollectionEvents', () => {
    const collectionEvent = factory.collectionEvent();
    const adapter: EntityAdapter<CollectionEvent> = createEntityAdapter<CollectionEvent>({
      selectId: (s: CollectionEvent) => s.id
    });
    const state = {
      collectionEvent: adapter.addAll([ collectionEvent ], initialState)
    };

    expect(selectors.selectAllCollectionEvents(state)).toEqual([ collectionEvent ]);
  });

  describe('selectCollectionEventSearchRepliesAndEntities', () => {

    it('when search has completed', () => {
      const collectionEvent = factory.collectionEvent();
      const adapter: EntityAdapter<CollectionEvent> = createEntityAdapter<CollectionEvent>({
        selectId: (s: CollectionEvent) => s.id
      });
      const pagedReply = factory.pagedReply<CollectionEvent>([ collectionEvent ]);
      const searchReplies: { [ key: string]: PagedReplyEntityIds } = {};
      searchReplies[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        collectionEvent: adapter.addAll([ collectionEvent ], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(selectors.selectCollectionEventSearchRepliesAndEntities(state)).toEqual({
        entities: [ collectionEvent ],
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
        collectionEvent: {
          ...initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(selectors.selectCollectionEventSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const collectionEvent = factory.collectionEvent();
      const adapter: EntityAdapter<CollectionEvent> = createEntityAdapter<CollectionEvent>({
        selectId: (s: CollectionEvent) => s.id
      });
      const pagedReply = factory.pagedReply<CollectionEvent>([ collectionEvent ]);
      const state = {
        collectionEvent: adapter.addAll([ collectionEvent ], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(selectors.selectCollectionEventSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectCollectionEventLastRemoved', () => {
    const collectionEvent = factory.collectionEvent();
    const adapter: EntityAdapter<CollectionEvent> = createEntityAdapter<CollectionEvent>({
      selectId: (s: CollectionEvent) => s.id
    });
    const state = {
      collectionEvent: adapter.addAll([ collectionEvent ], {
        ...initialState,
        lastRemovedId: collectionEvent.id
      })
    };

    expect(selectors.selectCollectionEventLastRemoved(state)).toEqual(collectionEvent);
  });

});
