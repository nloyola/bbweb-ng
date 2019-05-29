import { PagedReply, PagedReplyEntityIds, SearchParams, EntityIds } from '@app/domain';
import { CollectionEventType, EventTypeInfo, IStudy, ICollectionEventType } from '@app/domain/studies';
import { EventTypeStoreReducer, EventTypeStoreSelectors } from '@app/root-store';
import { Factory } from '@test/factory';

describe('EventTypeStore selectors', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  describe('selectSearchRepliesAndEntities', () => {

    let eventType: CollectionEventType;
    let pagedReply: PagedReply<CollectionEventType>;
    let searchReplies: { [ key: string]: PagedReplyEntityIds };

    beforeEach(() => {
      eventType = factory.collectionEventType();
      pagedReply = factory.pagedReply<CollectionEventType>([ eventType ]);
      searchReplies = {};
      searchReplies[factory.defaultStudy().id] = {} as any;
      searchReplies[factory.defaultStudy().id][pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset:       pagedReply.offset,
        total:        pagedReply.total,
        entityIds:    pagedReply.entities.map(e => e.id),
        maxPages:     pagedReply.maxPages
      };
    });

    it('returns entities', () => {
      const state = initialStateWithEntity(eventType, {
        searchState: {
          lastSearch: {
            studyId: factory.defaultStudy().id,
            params: pagedReply.searchParams
          },
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toEqual({
        entities: [ eventType ],
        hasNoEntitiesToDisplay: false,
        hasNoResultsToDisplay: false,
        hasResultsToDisplay: true,
        total: pagedReply.total,
        maxPages: pagedReply.maxPages,
        showPagination: false
      });
    });

    it('when search is active returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        searchState: {
          searchActive: true,
          lastSearch: pagedReply.searchParams,
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when there have been no previous searches returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        searchState: {
          lastSearch: null,
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when the search was never completed returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        searchState: {
          lastSearch: {
            studyId: factory.defaultStudy().id,
            params: new SearchParams(undefined, 'name')
          },
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  describe('selectNamesSearchRepliesAndEntities', () => {

    let study: IStudy;
    let eventType: CollectionEventType;
    const searchParams = new SearchParams();
    let searchReplies: { [ key: string]: EntityIds };

    beforeEach(() => {
      eventType = factory.collectionEventType();
      study = factory.defaultStudy().id;
      searchReplies = {};
      searchReplies[study.id] = {} as any;
      searchReplies[study.id][searchParams.queryString()] = [ eventType.id ];
    });

    it('returns entities', () => {
      const state = initialStateWithEntity(eventType, {
        namesSearchState: {
          lastSearch: {
            studyId: study.id,
            params: searchParams
          },
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectLastNamesSearchEntities(state)).toEqual([ eventType ]);
    });

    it('when search is active returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        namesSearchState: {
          searchActive: true,
          lastSearch: searchParams,
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when there have been no previous searches returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        namesSearchState: {
          lastSearch: null,
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when the search was never completed returns undefined', () => {
      const state = initialStateWithEntity(eventType, {
        namesSearchState: {
          lastSearch: {
            studyId: factory.defaultStudy().id,
            params: new SearchParams(undefined, 'name')
          },
          searchReplies
        }
      });

      expect(EventTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectLastAdded', () => {
    const eventType = factory.collectionEventType();
    const state = initialStateWithEntity(eventType, { lastAddedId: eventType.id });

    expect(EventTypeStoreSelectors.selectLastAdded(state)).toEqual(eventType);
  });

  function initialStateWithEntity(eventType: CollectionEventType, additionalState: any) {
    const state = {
      'event-type': {
        ...EventTypeStoreReducer.initialState,
        ids: [ eventType.id ],
        entities: {},
        ...additionalState
      }
    };

    state['event-type'].entities[eventType.id] = eventType;
    return state;
  }

});
