import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Specimen } from '@app/domain/participants';
import * as SpecimenActions from './specimen.actions';
import { SearchParams, PagedReplyEntityIds, searchParams2Term } from '@app/domain';

export interface State extends EntityState<Specimen> {
  lastAddedId: string;
  lastRemovedId: string;
  lastSearch?: SearchParams;
  searchActive?: boolean;
  searchReplies?: { [url: string]: PagedReplyEntityIds };
  error?: any;
}

export const adapter: EntityAdapter<Specimen> = createEntityAdapter<Specimen>();

export const initialState: State = adapter.getInitialState({
  lastAddedId: null,
  lastRemovedId: null,
  lastSearch: null,
  searchActive: false,
  searchReplies: {},
  error: null
});

export function reducer(state = initialState, action: SpecimenActions.SpecimenActionsUnion): State {
  switch (action.type) {
    case SpecimenActions.searchSpecimensRequest.type: {
      return {
        ...state,
        lastSearch: action.searchParams,
        searchActive: true,
        error: null
      };
    }

    case SpecimenActions.searchSpecimensSuccess.type: {
      const searchTerm = searchParams2Term(state.lastSearch);
      const newReply = {};
      newReply[searchTerm] = {
        entityIds: action.pagedReply.entities.map(specimen => specimen.id),
        searchParams: action.pagedReply.searchParams,
        offset: action.pagedReply.offset,
        total: action.pagedReply.total,
        maxPages: action.pagedReply.maxPages
      };

      return adapter.upsertMany(action.pagedReply.entities, {
        ...state,
        searchReplies: {
          ...state.searchReplies,
          ...newReply
        },
        searchActive: false
      });
    }

    case SpecimenActions.searchSpecimensFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case SpecimenActions.addSpecimensRequest.type: {
      return {
        ...state,
        lastAddedId: null
      };
    }

    case SpecimenActions.addSpecimensSuccess.type: {
      return state;
    }

    case SpecimenActions.addSpecimensFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case SpecimenActions.getSpecimenRequest.type: {
      return {
        ...state,
        error: null
      };
    }

    case SpecimenActions.getSpecimenSuccess.type: {
      return adapter.upsertOne(action.specimen, state);
    }

    case SpecimenActions.getSpecimenFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }

    case SpecimenActions.removeSpecimenRequest.type: {
      return {
        ...state,
        lastRemovedId: null,
        error: null
      };
    }

    case SpecimenActions.removeSpecimenSuccess.type: {
      return adapter.removeOne(action.specimenId, {
        ...state,
        lastRemovedId: action.specimenId
      });
    }

    case SpecimenActions.removeSpecimenFailure.type: {
      return {
        ...state,
        error: {
          error: action.error,
          actionType: action.type
        }
      };
    }
  }
  return state;
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
