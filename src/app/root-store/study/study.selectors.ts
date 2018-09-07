import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import * as fromStudy from './study.reducer';
import { SearchParamsReply, SearchParams } from '@app/domain';
import { Study, StudySearchReply } from '@app/domain/studies';
import { PagedReply } from '@app/domain';

export const getIsAdding = (state: fromStudy.State): any => state.isAdding;

export const getIsSearching = (state: fromStudy.State): any => state.isSearching;

export const getLastSearch = (state: fromStudy.State): any => state.lastSearch;

export const getIsLoadingCounts = (state: fromStudy.State): any => state.isLoadingCounts;

export const getError = (state: fromStudy.State): any => state.error;

export const getSearchReplies = (state: fromStudy.State): any => state.searchReplies;

export const getCounts = (state: fromStudy.State): any => state.studyCounts;

export const selectStudyState = createFeatureSelector<fromStudy.State>('study');

export const selectStudyIsAdding: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsAdding);

export const selectStudyIsSearching: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsSearching);

export const selectStudyLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectStudyState, getLastSearch);

export const selectStudyIsLoadingCounts: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsLoadingCounts);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);

export const selectStudyCounts: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getCounts);

export const selectStudySearchReplies: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getSearchReplies);

export const selectAllStudies = createSelector(
  selectStudyState,
  fromStudy.selectEntities
);

export const selectStudySearchRepliesAndEntities =
  createSelector(
    selectStudyIsSearching,
    selectStudyLastSearch,
    selectStudySearchReplies,
    selectAllStudies,
    (isSearching: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: SearchParamsReply },
     entities: any): StudySearchReply => {
      if (isSearching || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        studies: reply.entityIds.map(id => entities[id])
      };
    });
