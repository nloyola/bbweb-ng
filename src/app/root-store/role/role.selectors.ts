import { PagedReplyEntityIds, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { SearchReply } from '@app/domain/search-reply.model';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromRole from './role.reducer';

export const getSearchActive = (state: fromRole.State): boolean => state.searchActive;

export const getLastSearch = (state: fromRole.State): SearchParams => state.lastSearch;

export const getError = (state: fromRole.State): any => state.error;

export const getSearchReplies =
  (state: fromRole.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const selectRoleState = createFeatureSelector<fromRole.State>('role');

export const selectRoleSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectRoleState, getSearchActive);

export const selectRoleLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectRoleState, getLastSearch);

export const selectRoleError: MemoizedSelector<object, any> =
  createSelector(selectRoleState, getError);

export const selectRoleSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectRoleState, getSearchReplies);

export const selectAllRoles: MemoizedSelector<object, Role[]> =
  createSelector(selectRoleState, fromRole.selectAll);

export const selectAllRoleEntities =
  createSelector(selectRoleState, fromRole.selectEntities);

export const selectRoleSearchRepliesAndEntities =
  createSelector(
    selectRoleSearchActive,
    selectRoleLastSearch,
    selectRoleSearchReplies,
    createSelector(selectRoleState, fromRole.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): SearchReply<Role> => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        entities: reply.entityIds.map(id => entities[id])
      };
    });
