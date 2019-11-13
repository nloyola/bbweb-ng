import {
  PagedReplyEntityIds,
  SearchParams,
  pagedReplyToInfo,
  PagedReplyInfo,
  searchParams2Term
} from '@app/domain';
import { ShipmentSpecimen } from '@app/domain/shipments';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromShipmentSpecimen from './shipment-specimen.reducer';

export const getSearchActive = (state: fromShipmentSpecimen.State): boolean => state.searchActive;

export const getLastSearch = (state: fromShipmentSpecimen.State): SearchParams => state.lastSearch;

export const getSearchReplies = (state: fromShipmentSpecimen.State): { [url: string]: PagedReplyEntityIds } =>
  state.searchReplies;

export const getError = (state: fromShipmentSpecimen.State): any => state.error;

export const selectShipmentSpecimenState = createFeatureSelector<fromShipmentSpecimen.State>(
  'shipment-specimen'
);

export const selectShipmentSpecimenSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectShipmentSpecimenState,
  getSearchActive
);

export const selectShipmentSpecimenLastSearch: MemoizedSelector<object, SearchParams> = createSelector(
  selectShipmentSpecimenState,
  getLastSearch
);

export const selectShipmentError: MemoizedSelector<object, any> = createSelector(
  selectShipmentSpecimenState,
  getError
);

export const selectShipmentSpecimenSearchReplies: MemoizedSelector<
  object,
  { [url: string]: PagedReplyEntityIds }
> = createSelector(
  selectShipmentSpecimenState,
  getSearchReplies
);

export const selectAllShipmentSpecimens: MemoizedSelector<object, ShipmentSpecimen[]> = createSelector(
  selectShipmentSpecimenState,
  fromShipmentSpecimen.selectAll
);

export const selectAllShipmentEntities = createSelector(
  selectShipmentSpecimenState,
  fromShipmentSpecimen.selectEntities
);

export const selectShipmentSpecimenSearchRepliesAndEntities = createSelector(
  selectShipmentSpecimenSearchActive,
  selectShipmentSpecimenLastSearch,
  selectShipmentSpecimenSearchReplies,
  createSelector(
    selectShipmentSpecimenState,
    fromShipmentSpecimen.selectEntities
  ),
  (
    searchActive: boolean,
    lastSearch: SearchParams,
    searchReplies: { [url: string]: PagedReplyEntityIds },
    entities: any
  ): PagedReplyInfo<ShipmentSpecimen> => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    const searchTerm = searchParams2Term(lastSearch);
    const reply = searchReplies[searchTerm];
    if (reply === undefined) {
      return undefined;
    }

    return {
      ...pagedReplyToInfo(reply),
      entities: reply.entityIds.map(id => entities[id])
    };
  }
);
