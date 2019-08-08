import {
  PagedReplyInfo,
  pagedReplyToInfo,
  SearchTermToEntityIdsByEntityIdHash,
  SearchTermToPagedReplyByEntityHash
} from '@app/domain';
import { CollectionEventType } from '@app/domain/studies';
import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromEventType from './event-type.reducer';

export const getSearchActive = (state: fromEventType.State): boolean => state.searchState.searchActive;

export const getLastSearch = (state: fromEventType.State): fromEventType.LastSearch =>
  state.searchState.lastSearch;

export const getSearchReplies = (state: fromEventType.State): SearchTermToPagedReplyByEntityHash =>
  state.searchState.replies;

export const getNamesSearchActive = (state: fromEventType.State): boolean =>
  state.namesSearchState.searchActive;

export const getLastNamesSearch = (state: fromEventType.State): fromEventType.LastSearch =>
  state.namesSearchState.lastSearch;

export const getNamesSearchReplies = (state: fromEventType.State): SearchTermToEntityIdsByEntityIdHash =>
  state.namesSearchState.replies;

export const getLastAddedId = (state: fromEventType.State): string => state.lastAddedId;

export const getLastRemovedId = (state: fromEventType.State): string => state.lastRemovedId;

export const getSpecimenDefinitionNames = (
  state: fromEventType.State
): fromEventType.SpecimenDefinitionNamesByStudy => state.specimenDefinitionNames;

export const getError = (state: fromEventType.State): any => state.error;

export const selectEventTypeState = createFeatureSelector<fromEventType.State>('event-type');

export const selectSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectEventTypeState,
  getSearchActive
);

export const selectLastSearch: MemoizedSelector<object, fromEventType.LastSearch> = createSelector(
  selectEventTypeState,
  getLastSearch
);

export const selectSearchReplies: MemoizedSelector<
  object,
  SearchTermToPagedReplyByEntityHash
> = createSelector(
  selectEventTypeState,
  getSearchReplies
);

export const selectNamesSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectEventTypeState,
  getNamesSearchActive
);

export const selectLastNamesSearch: MemoizedSelector<object, fromEventType.LastSearch> = createSelector(
  selectEventTypeState,
  getLastNamesSearch
);

export const selectNamesSearchReplies: MemoizedSelector<
  object,
  SearchTermToEntityIdsByEntityIdHash
> = createSelector(
  selectEventTypeState,
  getNamesSearchReplies
);

export const selectAllEventTypes: MemoizedSelector<object, CollectionEventType[]> = createSelector(
  selectEventTypeState,
  fromEventType.selectAll
);

export const selectAllEventTypeEntities = createSelector(
  selectEventTypeState,
  fromEventType.selectEntities
);

export const selectLastAddedId: MemoizedSelector<object, string> = createSelector(
  selectEventTypeState,
  getLastAddedId
);

export const selectLastRemovedId: MemoizedSelector<object, string> = createSelector(
  selectEventTypeState,
  getLastRemovedId
);

export const selectSpecimenDefinitionNames: MemoizedSelector<
  object,
  fromEventType.SpecimenDefinitionNamesByStudy
> = createSelector(
  selectEventTypeState,
  getSpecimenDefinitionNames
);

export const selectError: MemoizedSelector<object, any> = createSelector(
  selectEventTypeState,
  getError
);

export const selectSearchRepliesAndEntities = createSelector(
  selectSearchActive,
  selectLastSearch,
  selectSearchReplies,
  selectAllEventTypeEntities,
  (
    searchActive: boolean,
    lastSearch: fromEventType.LastSearch,
    searchReplies: SearchTermToPagedReplyByEntityHash,
    entities: Dictionary<CollectionEventType>
  ): PagedReplyInfo<CollectionEventType> => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    const reply = searchReplies[lastSearch.studyId][JSON.stringify(lastSearch.params)];
    if (reply === undefined) {
      return undefined;
    }

    return {
      ...pagedReplyToInfo(reply),
      entities: reply.entityIds.map(id => {
        const entity = entities[id];
        if (entity) {
          return entity instanceof CollectionEventType
            ? entity
            : new CollectionEventType().deserialize(entity);
        }
        return undefined;
      })
    };
  }
);

export const selectLastNamesSearchEntities = createSelector(
  selectNamesSearchActive,
  selectLastNamesSearch,
  selectNamesSearchReplies,
  selectAllEventTypeEntities,
  (
    searchActive: boolean,
    lastSearch: fromEventType.LastSearch,
    searchReplies: SearchTermToEntityIdsByEntityIdHash,
    entities: Dictionary<CollectionEventType>
  ): CollectionEventType[] => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    const entityIds = searchReplies[lastSearch.studyId][JSON.stringify(lastSearch.params)];
    if (entityIds === undefined) {
      return undefined;
    }

    return entityIds.map(id => {
      const entity = entities[id];
      if (entity) {
        return entity instanceof CollectionEventType ? entity : new CollectionEventType().deserialize(entity);
      }
      return undefined;
    });
  }
);

export const selectLastAdded = createSelector(
  selectLastAddedId,
  selectAllEventTypeEntities,
  (id: string, entities: { [id: string]: CollectionEventType }): CollectionEventType => {
    return entities[id];
  }
);
