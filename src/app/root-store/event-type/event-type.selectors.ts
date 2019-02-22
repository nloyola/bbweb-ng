import { CollectedSpecimenDefinitionName, CollectionEventType } from '@app/domain/studies';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromEventType from './event-type.reducer';
import { SearchReply } from '@app/domain/search-reply.model';

export const getSearchActive = (state: fromEventType.State): boolean => state.searchActive;

export const getLastSearch =
  (state: fromEventType.State): fromEventType.LastSearch => state.lastSearch;

export const getSearchReplies =
  (state: fromEventType.State): fromEventType.PagedReplyHash => state.searchReplies;

export const getLastAddedId = (state: fromEventType.State): string => state.lastAddedId;

export const getSpecimenDefinitionNames =
  (state: fromEventType.State): CollectedSpecimenDefinitionName[] =>
  state.specimenDefinitionNames;

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

export const selectSpecimenDefinitionNames: MemoizedSelector<object, CollectedSpecimenDefinitionName[]> =
  createSelector(selectEventTypeState, getSpecimenDefinitionNames);

export const selectError: MemoizedSelector<object, any> =
  createSelector(selectEventTypeState, getError);

export const selectSearchRepliesAndEntities =
  createSelector(
    selectSearchActive,
    selectLastSearch,
    selectSearchReplies,
    createSelector(selectEventTypeState, fromEventType.selectEntities),
    (searchActive: boolean,
     lastSearch: fromEventType.LastSearch,
     searchReplies: fromEventType.PagedReplyHash,
     entities: any): SearchReply<CollectionEventType> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.studyId][lastSearch.params.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
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
