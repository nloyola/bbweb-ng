import { PagedReplyInfo, pagedReplyToInfo } from '@app/domain';
import { CollectionEventType } from '@app/domain/studies';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromEventType from './event-type.reducer';

export const getSearchActive = (state: fromEventType.State): boolean => state.searchActive;

export const getLastSearch =
  (state: fromEventType.State): fromEventType.LastSearch => state.lastSearch;

export const getSearchReplies =
  (state: fromEventType.State): fromEventType.PagedReplyHash => state.searchReplies;

export const getLastAddedId = (state: fromEventType.State): string => state.lastAddedId;

export const getLastRemovedId = (state: fromEventType.State): string => state.lastRemovedId;

export const getSpecimenDefinitionNames =
  (state: fromEventType.State): fromEventType.SpecimenDefinitionNamesByStudy => state.specimenDefinitionNames;

export const getError =
  (state: fromEventType.State): any => state.error;

export const selectEventTypeState = createFeatureSelector<fromEventType.State>('event-type');

export const selectSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectEventTypeState, getSearchActive);

export const selectLastSearch: MemoizedSelector<object, fromEventType.LastSearch> =
  createSelector(selectEventTypeState, getLastSearch);

export const selectSearchReplies: MemoizedSelector<object, fromEventType.PagedReplyHash> =
  createSelector(selectEventTypeState, getSearchReplies);

export const selectAllEventTypes: MemoizedSelector<object, CollectionEventType[]> =
  createSelector(selectEventTypeState, fromEventType.selectAll);

export const selectAllEventTypeEntities =
  createSelector(selectEventTypeState, fromEventType.selectEntities);

export const selectLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectEventTypeState, getLastAddedId);

export const selectLastRemovedId: MemoizedSelector<object, string> =
  createSelector(selectEventTypeState, getLastRemovedId);

export const selectSpecimenDefinitionNames:
MemoizedSelector<object, fromEventType.SpecimenDefinitionNamesByStudy> =
  createSelector(selectEventTypeState, getSpecimenDefinitionNames);

export const selectError: MemoizedSelector<object, any> =
  createSelector(selectEventTypeState, getError);

export const selectSearchRepliesAndEntities =
  createSelector(
    selectSearchActive,
    selectLastSearch,
    selectSearchReplies,
    selectAllEventTypeEntities,
    (searchActive: boolean,
     lastSearch: fromEventType.LastSearch,
     searchReplies: fromEventType.PagedReplyHash,
     entities: any): PagedReplyInfo<CollectionEventType> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.studyId][lastSearch.params.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        ...pagedReplyToInfo(reply),
        entities: reply.entityIds.map(id => entities[id])
      };
    });

export const selectLastAdded =
  createSelector(
    selectLastAddedId,
    selectAllEventTypeEntities,
    (id: string, entities: { [id: string]: CollectionEventType }): CollectionEventType => {
      return entities[id];
    });
