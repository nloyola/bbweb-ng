import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { SearchReply } from '@app/domain/search-reply.model';
import { User, UserCounts } from '@app/domain/users';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromUser from './user.reducer';

export const getLastAddedId = (state: fromUser.State): string => state.lastAddedId;

export const getSearchActive = (state: fromUser.State): boolean => state.searchActive;

export const getLastSearch = (state: fromUser.State): SearchParams => state.lastSearch;

export const getError = (state: fromUser.State): any => state.error;

export const getSearchReplies =
  (state: fromUser.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const getCounts = (state: fromUser.State): UserCounts => state.userCounts;

export const selectUserState = createFeatureSelector<fromUser.State>('user');

export const selectUserLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectUserState, getLastAddedId);

export const selectUserSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectUserState, getSearchActive);

export const selectUserLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectUserState, getLastSearch);

export const selectUserError: MemoizedSelector<object, any> =
  createSelector(selectUserState, getError);

export const selectUserCounts: MemoizedSelector<object, UserCounts> =
  createSelector(selectUserState, getCounts);

export const selectUserSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectUserState, getSearchReplies);

export const selectAllUsers: MemoizedSelector<object, User[]> =
  createSelector(selectUserState, fromUser.selectAll);

export const selectAllUserEntities =
  createSelector(selectUserState, fromUser.selectEntities);

export const selectUserSearchRepliesAndEntities =
  createSelector(
    selectUserSearchActive,
    selectUserLastSearch,
    selectUserSearchReplies,
    createSelector(selectUserState, fromUser.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): SearchReply<User> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        entities: reply.entityIds.map(id => entities[id])
      };
    });

export const selectUserLastAdded =
  createSelector(
    selectUserLastAddedId,
    selectAllUserEntities,
    (id: string, entities: { [id: string]: User }): User => {
      return entities[id];
    });
