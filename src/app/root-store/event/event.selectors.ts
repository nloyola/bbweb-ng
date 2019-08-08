import { PagedReplyEntityIds, PagedReplyInfo, SearchParams, pagedReplyToInfo } from '@app/domain';
import { CollectionEvent } from '@app/domain/participants';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromCollectionEvent from './event.reducer';

export const getLastAddedId = (state: fromCollectionEvent.State): string => state.lastAddedId;

export const getLastRemovedId = (state: fromCollectionEvent.State): string => state.lastRemovedId;

export const getSearchActive = (state: fromCollectionEvent.State): boolean => state.searchActive;

export const getLastSearch = (state: fromCollectionEvent.State): SearchParams => state.lastSearch;

export const getError = (state: fromCollectionEvent.State): any => state.error;

export const getSearchReplies = (state: fromCollectionEvent.State): { [url: string]: PagedReplyEntityIds } =>
  state.searchReplies;

export const selectCollectionEventState = createFeatureSelector<fromCollectionEvent.State>('event');

export const selectCollectionEventLastAddedId: MemoizedSelector<object, string> = createSelector(
  selectCollectionEventState,
  getLastAddedId
);

export const selectCollectionEventLastRemovedId: MemoizedSelector<object, string> = createSelector(
  selectCollectionEventState,
  getLastRemovedId
);

export const selectCollectionEventSearchActive: MemoizedSelector<object, boolean> = createSelector(
  selectCollectionEventState,
  getSearchActive
);

export const selectCollectionEventLastSearch: MemoizedSelector<object, SearchParams> = createSelector(
  selectCollectionEventState,
  getLastSearch
);

export const selectCollectionEventError: MemoizedSelector<object, any> = createSelector(
  selectCollectionEventState,
  getError
);

export const selectCollectionEventSearchReplies: MemoizedSelector<
  object,
  { [url: string]: PagedReplyEntityIds }
> = createSelector(
  selectCollectionEventState,
  getSearchReplies
);

export const selectAllCollectionEvents: MemoizedSelector<object, CollectionEvent[]> = createSelector(
  selectCollectionEventState,
  fromCollectionEvent.selectAll
);

export const selectAllCollectionEventEntities = createSelector(
  selectCollectionEventState,
  fromCollectionEvent.selectEntities
);

export const selectCollectionEventSearchRepliesAndEntities = createSelector(
  selectCollectionEventSearchActive,
  selectCollectionEventLastSearch,
  selectCollectionEventSearchReplies,
  createSelector(
    selectCollectionEventState,
    fromCollectionEvent.selectEntities
  ),
  (
    searchActive: boolean,
    lastSearch: SearchParams,
    searchReplies: { [url: string]: PagedReplyEntityIds },
    entities: any
  ): PagedReplyInfo<CollectionEvent> => {
    if (searchActive || lastSearch === null) {
      return undefined;
    }

    const reply = searchReplies[JSON.stringify(lastSearch)];
    if (reply === undefined) {
      return undefined;
    }

    return {
      ...pagedReplyToInfo(reply),
      entities: reply.entityIds.map(id => entities[id])
    };
  }
);

export const selectCollectionEventLastAdded = createSelector(
  selectCollectionEventLastAddedId,
  selectAllCollectionEventEntities,
  (id: string, entities: { [id: string]: CollectionEvent }): CollectionEvent => {
    return entities[id];
  }
);

export const selectCollectionEventLastRemoved = createSelector(
  selectCollectionEventLastRemovedId,
  selectAllCollectionEventEntities,
  (id: string, entities: { [id: string]: CollectionEvent }): CollectionEvent => {
    return entities[id];
  }
);
