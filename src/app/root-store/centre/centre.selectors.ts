import {
  PagedReplyInfo,
  pagedReplyToInfo,
  SearchParams,
  searchParams2Term,
  SearchTermToPagedReplyHash
} from '@app/domain';
import { Centre, CentreCounts, CentreLocationInfo } from '@app/domain/centres';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromCentre from './centre.reducer';

export const getLastAddedId = (state: fromCentre.State): string => state.lastAddedId;

export const getSearchActive = (state: fromCentre.State): boolean => state.searchState.searchActive;

export const getLastSearch = (state: fromCentre.State): SearchParams => state.searchState.lastSearch;

export const getLocationsSearchActive = (state: fromCentre.State): boolean =>
  state.locationsSearchState.searchActive;

export const getLocationsLastSearch = (state: fromCentre.State): string =>
  state.locationsSearchState.lastSearch;

export const getError = (state: fromCentre.State): any => state.error;

export const getSearchReplies = (state: fromCentre.State): SearchTermToPagedReplyHash =>
  state.searchState.replies;

export const getLocationsSearchReplies = (state: fromCentre.State): fromCentre.LocationsSearchResultHash =>
  state.locationsSearchState.replies;

export const getCounts = (state: fromCentre.State): CentreCounts => state.centreCounts;

export const selectCentreState = createFeatureSelector<fromCentre.State>('centre');

export const selectCentreLastAddedId: MemoizedSelector<object, string> = createSelector(
  selectCentreState,
  getLastAddedId
);

export const selectCentreSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectCentreState,
  getSearchActive
);

export const selectCentreLastSearch: MemoizedSelector<object, SearchParams> = createSelector(
  selectCentreState,
  getLastSearch
);

export const selectCentreSearchReplies: MemoizedSelector<object, SearchTermToPagedReplyHash> = createSelector(
  selectCentreState,
  getSearchReplies
);

export const selectLocationsSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectCentreState,
  getLocationsSearchActive
);

export const selectLocationsLastSearch: MemoizedSelector<object, string> = createSelector(
  selectCentreState,
  getLocationsLastSearch
);

export const selectLocationsSearchReplies: MemoizedSelector<
  object,
  fromCentre.LocationsSearchResultHash
> = createSelector(
  selectCentreState,
  getLocationsSearchReplies
);

export const selectLastLocationsSearchReplies = createSelector(
  selectLocationsSearchActive,
  selectLocationsLastSearch,
  selectLocationsSearchReplies,
  (
    searchActive: boolean,
    lastSearch: string,
    replies: fromCentre.LocationsSearchResultHash
  ): CentreLocationInfo[] => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    return replies[lastSearch];
  }
);

export const selectCentreError: MemoizedSelector<object, any> = createSelector(
  selectCentreState,
  getError
);

export const selectCentreCounts: MemoizedSelector<object, CentreCounts> = createSelector(
  selectCentreState,
  getCounts
);

export const selectAllCentres: MemoizedSelector<object, Centre[]> = createSelector(
  selectCentreState,
  fromCentre.selectAll
);

export const selectAllCentreEntities = createSelector(
  selectCentreState,
  fromCentre.selectEntities
);

export const selectCentreSearchRepliesAndEntities = createSelector(
  selectCentreSearchActive,
  selectCentreLastSearch,
  selectCentreSearchReplies,
  selectAllCentreEntities,
  (
    searchActive: boolean,
    lastSearch: SearchParams,
    replies: SearchTermToPagedReplyHash,
    entities: any
  ): PagedReplyInfo<Centre> => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    const reply = replies[searchParams2Term(lastSearch)];
    if (reply === undefined) {
      return undefined;
    }

    return {
      ...pagedReplyToInfo(reply),
      entities: reply.entityIds.map(id => entities[id])
    };
  }
);

export const selectCentreLastAdded = createSelector(
  selectCentreLastAddedId,
  selectAllCentreEntities,
  (id: string, entities: { [id: string]: Centre }): Centre => {
    return entities[id];
  }
);
