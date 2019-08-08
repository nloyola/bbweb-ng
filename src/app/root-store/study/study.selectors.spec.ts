import { PagedReplyEntityIds, PagedReplyInfo, SearchParams, SearchTermToPagedReplyHash } from '@app/domain';
import { Study } from '@app/domain/studies';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Factory } from '@test/factory';
import { initialState } from './study.reducer';
import * as Selectors from './study.selectors';

describe('study-store selectors', () => {
  interface SearchBehavoiurContext {
    selectSearchActive?: (state: any) => boolean;
    selectLastSearch?: (state: any) => SearchParams;
    selectSearchReplies?: (state: any) => SearchTermToPagedReplyHash;
    selectSearchRepliesAndEntities?: (state: any) => PagedReplyInfo<Study>;
    stateKey?: string;
  }

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('selectStudyLastAdded', () => {
    const study = new Study().deserialize(factory.study());
    const state = {
      study: {
        ...initialState,
        lastAddedId: study.id
      }
    };

    expect(Selectors.selectStudyLastAddedId(state)).toBe(study.id);
  });

  it('selectStudyCounts', () => {
    const studyCounts = factory.studyCounts();
    const state = {
      study: {
        ...initialState,
        studyCounts
      }
    };

    expect(Selectors.selectStudyCounts(state)).toBe(studyCounts);
  });

  it('selectAllStudies', () => {
    const study = new Study().deserialize(factory.study());
    const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
      selectId: (s: Study) => s.id
    });
    const state = {
      study: adapter.addAll([study], initialState)
    };

    expect(Selectors.selectAllStudies(state)).toEqual([study]);
  });

  it('selectStudyLastAdded', () => {
    const study = new Study().deserialize(factory.study());
    const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
      selectId: (s: Study) => s.id
    });
    const state = {
      study: adapter.addAll([study], {
        ...initialState,
        lastAddedId: study.id
      })
    };

    expect(Selectors.selectStudyLastAdded(state)).toEqual(study);
  });

  it('selectStudyLastAdded', () => {
    const state = {
      study: {
        ...initialState,
        error: {
          status: 404,
          error: {
            message: 'error'
          }
        }
      }
    };

    expect(Selectors.selectStudyError(state)).toBeTruthy();
  });

  describe('when searching studies', () => {
    describe('for replies', () => {
      it('select search replies', () => {
        const study = new Study().deserialize(factory.study());
        const pagedReply = factory.pagedReply<Study>([study]);
        const searchTerm = JSON.stringify(pagedReply.searchParams);
        const replies: { [searchTerm: string]: PagedReplyEntityIds } = {};
        replies[searchTerm] = {
          searchParams: pagedReply.searchParams,
          offset: pagedReply.offset,
          total: pagedReply.total,
          entityIds: pagedReply.entities.map(e => e.id),
          maxPages: pagedReply.maxPages
        };
        const state = {
          study: {
            ...initialState,
            searchState: {
              ...initialState.searchState,
              replies
            }
          }
        };

        expect(Selectors.selectStudiesSearchReplies(state)).toBe(replies);
      });

      describe('select search replies and entities', () => {
        it('when search has completed', () => {
          const study = new Study().deserialize(factory.study());
          const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
            selectId: (s: Study) => s.id
          });
          const pagedReply = factory.pagedReply<Study>([study]);
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
            study: adapter.addAll([study], {
              ...initialState,
              searchState: {
                ...initialState.searchState,
                searchActive: false,
                lastSearch: pagedReply.searchParams,
                replies
              }
            })
          };

          expect(Selectors.selectStudySearchRepliesAndEntities(state)).toEqual({
            entities: [study],
            hasNoEntitiesToDisplay: false,
            hasNoResultsToDisplay: false,
            hasResultsToDisplay: true,
            total: pagedReply.total,
            maxPages: pagedReply.maxPages,
            showPagination: false
          });
        });

        it('when there is no last search', () => {
          const state = { study: initialState };
          expect(Selectors.selectStudySearchRepliesAndEntities(state)).toBeUndefined();
        });

        it('when reply is missing', () => {
          const study = new Study().deserialize(factory.study());
          const adapter: EntityAdapter<Study> = createEntityAdapter<Study>({
            selectId: (s: Study) => s.id
          });
          const pagedReply = factory.pagedReply<Study>([study]);
          const state = {
            study: adapter.addAll([study], {
              ...initialState,
              searchState: {
                ...initialState.searchState,
                searchReplies: {
                  ...initialState.searchState.replies,
                  searchActive: false,
                  lastSearch: pagedReply.searchParams,
                  searchReplies: {}
                }
              }
            })
          };

          expect(Selectors.selectStudySearchRepliesAndEntities(state)).toBeUndefined();
        });
      });
    });

    describe('common', () => {
      const context: SearchBehavoiurContext = {};

      beforeEach(() => {
        context.selectSearchActive = (state: any) => Selectors.selectStudiesSearchActive(state);
        context.selectLastSearch = (state: any) => Selectors.selectStudiesLastSearch(state);
        context.stateKey = 'searchState';
      });

      sharedSearchBehaviour(context);
    });
  });

  describe('when searching collection studies', () => {
    const context: SearchBehavoiurContext = {};

    beforeEach(() => {
      context.selectSearchActive = (state: any) => Selectors.selectCollectionStudiesSearchActive(state);
      context.selectLastSearch = (state: any) => Selectors.selectCollectionStudiesLastSearch(state);
      // context.selectSearchReplies =
      //   (state: any) => Selectors.selectCollectionStudiesSearchReplies(state);
      // context.selectSearchRepliesAndEntities =
      //   (state: any) => Selectors.selectCollectionStudiesSearchRepliesAndEntities(state);
      context.stateKey = 'searchCollectionStudiesState';
    });

    sharedSearchBehaviour(context);
  });

  function sharedSearchBehaviour(context: SearchBehavoiurContext) {
    describe('shared behaviour', () => {
      it('select search active', () => {
        const state = { study: { ...initialState } };
        state['study'][context.stateKey] = {
          ...initialState[context.stateKey],
          searchActive: true
        };

        expect(context.selectSearchActive(state)).toBeTruthy();
      });

      it('select last search', () => {
        const searchParams = {};
        const state = { study: { ...initialState } };
        state['study'][context.stateKey] = {
          ...initialState[context.stateKey],
          lastSearch: searchParams
        };

        expect(context.selectLastSearch(state)).toBe(searchParams);
      });
    });
  }
});
