import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { CollectionEvent, Specimen } from '@app/domain/participants';
import { Factory } from '@test/factory';
import * as SpecimenActions from './specimen.actions';
import { initialState, reducer } from './specimen.reducer';

describe('Specimen Reducer', () => {

  const factory = new Factory();

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('when searching for specimens', () => {

    it('SearchSpecimensRequest', () => {
      const event = new CollectionEvent().deserialize(factory.collectionEvent());
      const searchParams = new SearchParams();
      const action = SpecimenActions.searchSpecimensRequest({ event, searchParams });
      const state = reducer(undefined, action);

      expect(state).toEqual({
        ...initialState,
        lastSearch: searchParams,
        searchActive: true
      });
    });

    it('SearchSpecimensSuccess', () => {
      const specimen = new Specimen().deserialize(factory.specimen());
      const pagedReply = factory.pagedReply<Specimen>([ specimen ]);
      const action = SpecimenActions.searchSpecimensSuccess({ pagedReply });
      const state = reducer(
        {
          ...initialState,
          lastSearch: pagedReply.searchParams
        },
        action);

      const searchReply: { [ key: string]: PagedReplyEntityIds } = {};
      searchReply[pagedReply.searchParams.queryString()] = {
        searchParams: pagedReply.searchParams,
        offset:       pagedReply.offset,
        total:        pagedReply.total,
        entityIds:    pagedReply.entities.map(e => e.id),
        maxPages:     pagedReply.maxPages
      };

      expect(state.searchReplies).toEqual(searchReply);
      expect(state.searchActive).toBe(false);
      expect(state.ids).toContain(specimen.id);
      expect(state.entities[specimen.id]).toEqual(specimen);
    });

    it('SearchSpecimensFailure', () => {
      const error = {
        status: 404,
          error: {
            message: 'simulated error'
          }
      };
      const action = SpecimenActions.searchSpecimensFailure({ error });
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

  describe('when getting a specimen', () => {

    let specimen: Specimen;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
    });

    it('GetSpecimenRequest', () => {
      const action = SpecimenActions.getSpecimenRequest({ id: specimen.id });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('GetSpecimenSuccess', () => {
      const action = SpecimenActions.getSpecimenSuccess({ specimen: specimen });
      const state = reducer(undefined, action);

      expect(state.ids).toContain(specimen.id);
      expect(state.entities[specimen.id]).toEqual(specimen);
    });

    it('GetSpecimenFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = SpecimenActions.getSpecimenFailure(payload);
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

  describe('when adding a specimen', () => {

    let event: CollectionEvent;
    let specimens: Specimen[];

    beforeEach(() => {
      event = new CollectionEvent().deserialize(factory.collectionEvent());
      specimens = [ new Specimen().deserialize(factory.specimen()) ];
    });

    it('AddSpecimenRequest', () => {
      const action = SpecimenActions.addSpecimensRequest({ event, specimens });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('AddSpecimenSuccess', () => {
      const action = SpecimenActions.addSpecimensSuccess({ event });
      const state = reducer(undefined, action);
      expect(state).toEqual(initialState);
    });

    it('AddSpecimenFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = SpecimenActions.addSpecimensFailure(payload);
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

  describe('when removing a specimen', () => {

    let specimen: Specimen;

    beforeEach(() => {
      specimen = new Specimen().deserialize(factory.specimen());
    });

    it('removeSpecimenRequest', () => {
      const action = SpecimenActions.removeSpecimenRequest({ specimen: specimen });
      const state = reducer(undefined, action);

      expect(state).toEqual(initialState);
    });

    it('removeSpecimenSuccess', () => {
      const testInitialState = {
        ...initialState,
        ids: [ specimen.id ],
        entities: {}
      };
      testInitialState['entities'][specimen.id] = specimen;

      const action = SpecimenActions.removeSpecimenSuccess({ specimenId: specimen.id });
      const state = reducer(testInitialState, action);

      expect(state.ids).not.toContain(specimen.id);
      expect(state.entities[specimen.id]).toBeUndefined();
      expect(state.lastRemovedId).toBe(specimen.id);
    });

    it('removeSpecimenFailure', () => {
      const payload = {
        error: {
          status: 404,
          error: {
            message: 'simulated error'
          }
        }
      };
      const action = SpecimenActions.removeSpecimenFailure(payload);
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

});
