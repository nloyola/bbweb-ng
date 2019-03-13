import { PagedReplyEntityIds, SearchParams, PagedReply } from '@app/domain';
import { ProcessingType } from '@app/domain/studies';
import { ProcessingTypeStoreReducer, ProcessingTypeStoreSelectors } from '@app/root-store';
import { Factory } from '@test/factory';

describe('ProcessingTypeStore selectors', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  describe('selectSearchRepliesAndEntities', () => {

    let processingType: ProcessingType;
    let pagedReply: PagedReply<ProcessingType>;
    let searchReplies: { [ key: string]: PagedReplyEntityIds };

    beforeEach(() => {
      processingType = factory.processingType();
      pagedReply = factory.pagedReply<ProcessingType>([ processingType ]);
      searchReplies = {};
      searchReplies[processingType.studyId] = {} as any;
      searchReplies[processingType.studyId][pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset:       pagedReply.offset,
        total:        pagedReply.total,
        entityIds:    pagedReply.entities.map((e: any) => e.id),
        maxPages:     pagedReply.maxPages
      };
    });

    it('returns entities', () => {
      const state = initialStateWithEntity(processingType, {
        lastSearch: {
          studyId: processingType.studyId,
          params: pagedReply.searchParams
        },
        searchReplies
      });

      expect(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toEqual({
        reply: searchReplies[processingType.studyId][pagedReply.searchParams.queryString()],
        entities: [ processingType ]
      });
    });

    it('when search is active returns undefined', () => {
      const state = initialStateWithEntity(processingType, {
        searchActive: true,
        lastSearch: pagedReply.searchParams,
        searchReplies
      });

      expect(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when there have been no previous searches returns undefined', () => {
      const state = initialStateWithEntity(processingType, {
        lastSearch: null,
        searchReplies
      });

      expect(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when the search was never completed returns undefined', () => {
      const state = initialStateWithEntity(processingType, {
        lastSearch: {
          studyId: processingType.studyId,
          params: new SearchParams(undefined, 'name')
        },
        searchReplies
      });

      expect(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities(state)).toBeUndefined();
    });

  });

  it('selectLastAdded', () => {
    const processingType = factory.processingType();
    const state = initialStateWithEntity(processingType, { lastAddedId: processingType.id });

    expect(ProcessingTypeStoreSelectors.selectLastAdded(state)).toEqual(processingType);
  });

  function initialStateWithEntity(processingType: ProcessingType, additionalState: any) {
    const state = {
      'processing-type': {
        ...ProcessingTypeStoreReducer.initialState,
        ids: [ processingType.id ],
        entities: {},
        ...additionalState
      }
    };

    state['processing-type'].entities[processingType.id] = processingType;
    return state;
  }

});
