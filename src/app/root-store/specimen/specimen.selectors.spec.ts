import { PagedReplyEntityIds } from '@app/domain';
import { Specimen } from '@app/domain/participants';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Factory } from '@test/factory';
import { initialState } from './specimen.reducer';
import * as selectors from './specimen.selectors';

describe('specimen-store selectors', () => {
  const factory = new Factory();

  it('selectSpecimenLastAdded', () => {
    const specimen = factory.specimen();
    const state = {
      specimen: {
        ...initialState,
        lastAddedId: specimen.id
      }
    };

    expect(selectors.selectSpecimenLastAddedId(state)).toBe(specimen.id);
  });
  it('selectSpecimenLastRemoved', () => {
    const specimen = factory.specimen();
    const state = {
      specimen: {
        ...initialState,
        lastRemovedId: specimen.id
      }
    };

    expect(selectors.selectSpecimenLastRemovedId(state)).toBe(specimen.id);
  });

  it('selectSpecimenSearchActive', () => {
    const state = {
      specimen: {
        ...initialState,
        searchActive: true
      }
    };

    expect(selectors.selectSpecimenSearchActive(state)).toBeTruthy();
  });

  it('selectSpecimenLastSearch', () => {
    const searchParams = {};
    const state = {
      specimen: {
        ...initialState,
        lastSearch: searchParams
      }
    };

    expect(selectors.selectSpecimenLastSearch(state)).toBe(searchParams);
  });

  it('selectSpecimenSearchReplies', () => {
    const specimen = new Specimen().deserialize(factory.specimen());
    const pagedReply = factory.pagedReply<Specimen>([specimen]);
    const searchReplies: { [key: string]: PagedReplyEntityIds } = {};
    searchReplies[JSON.stringify(pagedReply.searchParams)] = {
      searchParams: pagedReply.searchParams,
      offset: pagedReply.offset,
      total: pagedReply.total,
      entityIds: pagedReply.entities.map(e => e.id),
      maxPages: pagedReply.maxPages
    };
    const state = {
      specimen: {
        ...initialState,
        searchReplies
      }
    };

    expect(selectors.selectSpecimenSearchReplies(state)).toBe(searchReplies);
  });

  it('selectAllSpecimens', () => {
    const specimen = new Specimen().deserialize(factory.specimen());
    const adapter: EntityAdapter<Specimen> = createEntityAdapter<Specimen>({
      selectId: (s: Specimen) => s.id
    });
    const state = {
      specimen: adapter.addAll([specimen], initialState)
    };

    expect(selectors.selectAllSpecimens(state)).toEqual([specimen]);
  });

  describe('selectSpecimenSearchRepliesAndEntities', () => {
    it('when search has completed', () => {
      const specimen = new Specimen().deserialize(factory.specimen());
      const adapter: EntityAdapter<Specimen> = createEntityAdapter<Specimen>({
        selectId: (s: Specimen) => s.id
      });
      const pagedReply = factory.pagedReply<Specimen>([specimen]);
      const searchReplies: { [key: string]: PagedReplyEntityIds } = {};
      searchReplies[JSON.stringify(pagedReply.searchParams)] = {
        searchParams: pagedReply.searchParams,
        offset: pagedReply.offset,
        total: pagedReply.total,
        entityIds: pagedReply.entities.map(e => e.id),
        maxPages: pagedReply.maxPages
      };
      const state = {
        specimen: adapter.addAll([specimen], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies
        })
      };

      expect(selectors.selectSpecimenSearchRepliesAndEntities(state)).toEqual({
        entities: [specimen],
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
        specimen: {
          ...initialState,
          searchActive: false,
          lastSearch: null
        }
      };

      expect(selectors.selectSpecimenSearchRepliesAndEntities(state)).toBeUndefined();
    });

    it('when reply is missing', () => {
      const specimen = new Specimen().deserialize(factory.specimen());
      const adapter: EntityAdapter<Specimen> = createEntityAdapter<Specimen>({
        selectId: (s: Specimen) => s.id
      });
      const pagedReply = factory.pagedReply<Specimen>([specimen]);
      const state = {
        specimen: adapter.addAll([specimen], {
          ...initialState,
          searchActive: false,
          lastSearch: pagedReply.searchParams,
          searchReplies: {}
        })
      };

      expect(selectors.selectSpecimenSearchRepliesAndEntities(state)).toBeUndefined();
    });
  });
});
