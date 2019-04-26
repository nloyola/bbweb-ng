import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { Specimen } from '@app/domain/participants';
import { SearchReply } from '@app/domain/search-reply.model';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromSpecimen from './specimen.reducer';

export const getLastAddedId = (state: fromSpecimen.State): string => state.lastAddedId;

export const getLastRemovedId = (state: fromSpecimen.State): string => state.lastRemovedId;

export const getSearchActive = (state: fromSpecimen.State): boolean => state.searchActive;

export const getLastSearch = (state: fromSpecimen.State): SearchParams => state.lastSearch;

export const getError = (state: fromSpecimen.State): any => state.error;

export const getSearchReplies =
  (state: fromSpecimen.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const selectSpecimenState = createFeatureSelector<fromSpecimen.State>('specimen');

export const selectSpecimenLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectSpecimenState, getLastAddedId);

export const selectSpecimenLastRemovedId: MemoizedSelector<object, string> =
  createSelector(selectSpecimenState, getLastRemovedId);

export const selectSpecimenSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectSpecimenState, getSearchActive);

export const selectSpecimenLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectSpecimenState, getLastSearch);

export const selectSpecimenError: MemoizedSelector<object, any> =
  createSelector(selectSpecimenState, getError);

export const selectSpecimenSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectSpecimenState, getSearchReplies);

export const selectAllSpecimens: MemoizedSelector<object, Specimen[]> =
  createSelector(selectSpecimenState, fromSpecimen.selectAll);

export const selectAllSpecimenEntities =
  createSelector(selectSpecimenState, fromSpecimen.selectEntities);

export const selectSpecimenSearchRepliesAndEntities =
  createSelector(
    selectSpecimenSearchActive,
    selectSpecimenLastSearch,
    selectSpecimenSearchReplies,
    createSelector(selectSpecimenState, fromSpecimen.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): SearchReply<Specimen> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        entities: reply.entityIds.map(id => entities[id])
      };
    });

export const selectSpecimenLastAdded =
  createSelector(
    selectSpecimenLastAddedId,
    selectAllSpecimenEntities,
    (id: string, entities: { [id: string]: Specimen }): Specimen => {
      return entities[id];
    });

export const selectSpecimenLastRemoved =
  createSelector(
    selectSpecimenLastRemovedId,
    selectAllSpecimenEntities,
    (id: string, entities: { [id: string]: Specimen }): Specimen => {
      return entities[id];
    });
