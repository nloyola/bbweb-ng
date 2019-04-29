import { PagedReplyEntityIds, PagedReplyInfo, pagedReplyToInfo, SearchParams } from '@app/domain';
import { Shipment } from '@app/domain/shipments';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromShipment from './shipment.reducer';

export const getLastAddedId = (state: fromShipment.State): string => state.lastAddedId;

export const getLastRemovedId = (state: fromShipment.State): string => state.lastRemovedId;

export const getSearchActive = (state: fromShipment.State): boolean => state.searchActive;

export const getLastSearch = (state: fromShipment.State): SearchParams => state.lastSearch;

export const getCanAddInventoryId = (state: fromShipment.State): string[] =>
  state.canAddSpecimenInventoryIds;

export const getError = (state: fromShipment.State): any => state.error;

export const getSearchReplies =
  (state: fromShipment.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const selectShipmentState = createFeatureSelector<fromShipment.State>('shipment');

export const selectShipmentLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectShipmentState, getLastAddedId);

export const selectShipmentLastRemovedId: MemoizedSelector<object, string> =
  createSelector(selectShipmentState, getLastRemovedId);

export const selectShipmentSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectShipmentState, getSearchActive);

export const selectShipmentLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectShipmentState, getLastSearch);

export const selectCanAddInventoryId: MemoizedSelector<object, string[]> =
  createSelector(selectShipmentState, getCanAddInventoryId);

export const selectShipmentError: MemoizedSelector<object, any> =
  createSelector(selectShipmentState, getError);

export const selectShipmentSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectShipmentState, getSearchReplies);

export const selectAllShipments: MemoizedSelector<object, Shipment[]> =
  createSelector(selectShipmentState, fromShipment.selectAll);

export const selectAllShipmentEntities =
  createSelector(selectShipmentState, fromShipment.selectEntities);

export const selectShipmentSearchRepliesAndEntities =
  createSelector(
    selectShipmentSearchActive,
    selectShipmentLastSearch,
    selectShipmentSearchReplies,
    createSelector(selectShipmentState, fromShipment.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): PagedReplyInfo<Shipment> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        ...pagedReplyToInfo(reply),
        entities: reply.entityIds.map(id => entities[id])
      };
    });

export const selectShipmentLastAdded =
  createSelector(
    selectShipmentLastAddedId,
    selectAllShipmentEntities,
    (id: string, entities: { [id: string]: Shipment }): Shipment => {
      return entities[id];
    });

export const selectShipmentLastRemoved =
  createSelector(
    selectShipmentLastRemovedId,
    selectAllShipmentEntities,
    (id: string, entities: { [id: string]: Shipment }): Shipment => {
      return entities[id];
    });
