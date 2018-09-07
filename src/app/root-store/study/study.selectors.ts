import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import * as fromStudy from './study.reducer';
import { SearchParamsReply } from '@app/domain';
import { Study } from '@app/domain/studies';
import { PagedReply } from '@app/domain';

export const getIsAdding = (state: fromStudy.State): any => state.isAdding;

export const getIsSearching = (state: fromStudy.State): any => state.isSearching;

export const getIsLoadingCounts = (state: fromStudy.State): any => state.isLoadingCounts;

export const getError = (state: fromStudy.State): any => state.error;

export const getCounts = (state: fromStudy.State): any => state.studyCounts;

export const getSearchResults = (state: fromStudy.State): any => state.searchResults;

export const selectStudyState = createFeatureSelector<fromStudy.State>('study');

export const selectStudyIsAdding: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsAdding);

export const selectStudyIsSearching: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsSearching);

export const selectStudyIsLoadingCounts: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getIsLoadingCounts);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);

export const selectStudyCounts: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getCounts);

export const selectSearchResults: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getSearchResults);

export const selectAllStudies = createSelector(
    selectStudyState,
    fromStudy.selectEntities
);

export const selectSearchResultsAndStudies: MemoizedSelector<object, any> =
  createSelector(
    selectSearchResults,
    selectAllStudies,
    (replies: SearchParamsReply[], entities: any) => {
      return replies.map(
        (results: SearchParamsReply) => {
          const studies  = results.entityIds.map(id => entities[id]);
          return {
            ...results,
            studies: studies
          };
        });
    });
