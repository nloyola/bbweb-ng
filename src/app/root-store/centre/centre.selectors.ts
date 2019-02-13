import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Centre, CentreSearchReply, CentreCounts } from '@app/domain/centres';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromCentre from './centre.reducer';

export const getLastAddedId = (state: fromCentre.State): string => state.lastAddedId;

export const getSearchActive = (state: fromCentre.State): boolean => state.searchActive;

export const getLastSearch = (state: fromCentre.State): SearchParams => state.lastSearch;

export const getError = (state: fromCentre.State): any => state.error;

export const getSearchReplies =
  (state: fromCentre.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const getCounts = (state: fromCentre.State): CentreCounts => state.centreCounts;

export const selectCentreState = createFeatureSelector<fromCentre.State>('centre');

export const selectCentreLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectCentreState, getLastAddedId);

export const selectCentreSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectCentreState, getSearchActive);

export const selectCentreLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectCentreState, getLastSearch);

export const selectCentreError: MemoizedSelector<object, any> =
  createSelector(selectCentreState, getError);

export const selectCentreCounts: MemoizedSelector<object, CentreCounts> =
  createSelector(selectCentreState, getCounts);

export const selectCentreSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectCentreState, getSearchReplies);

export const selectAllCentres: MemoizedSelector<object, Centre[]> =
  createSelector(selectCentreState, fromCentre.selectAll);

export const selectAllCentreEntities =
  createSelector(selectCentreState, fromCentre.selectEntities);

export const selectCentreSearchRepliesAndEntities =
  createSelector(
    selectCentreSearchActive,
    selectCentreLastSearch,
    selectCentreSearchReplies,
    createSelector(selectCentreState, fromCentre.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): CentreSearchReply => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        centres: reply.entityIds.map(id => entities[id])
      };
    });

export const selectCentreLastAdded =
  createSelector(
    selectCentreLastAddedId,
    selectAllCentreEntities,
    (id: string, entities: { [id: string]: Centre }): Centre => {
      return entities[id];
    });
