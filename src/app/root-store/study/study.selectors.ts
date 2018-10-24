import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Study, StudySearchReply, StudyCounts } from '@app/domain/studies';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromStudy from './study.reducer';

export const getLastAddedId = (state: fromStudy.State): string => state.lastAddedId;

export const getSearchActive = (state: fromStudy.State): boolean => state.searchActive;

export const getLastSearch = (state: fromStudy.State): SearchParams => state.lastSearch;

export const getError = (state: fromStudy.State): any => state.error;

export const getSearchReplies =
  (state: fromStudy.State): { [ url: string ]: PagedReplyEntityIds } => state.searchReplies;

export const getCounts = (state: fromStudy.State): StudyCounts => state.studyCounts;

export const getEnableAllowedIds = (state: fromStudy.State): string[] => state.enableAllowedIds;

export const selectStudyState = createFeatureSelector<fromStudy.State>('study');

export const selectStudyLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectStudyState, getLastAddedId);

export const selectStudySearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getSearchActive);

export const selectStudyLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectStudyState, getLastSearch);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);

export const selectStudyCounts: MemoizedSelector<object, StudyCounts> =
  createSelector(selectStudyState, getCounts);

export const selectStudyEnableAllowedIds: MemoizedSelector<object, string[]> =
  createSelector(selectStudyState, getEnableAllowedIds);

export const selectStudySearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectStudyState, getSearchReplies);

export const selectAllStudies: MemoizedSelector<object, Study[]> =
  createSelector(selectStudyState, fromStudy.selectAll);

export const selectAllStudyEntities =
  createSelector(selectStudyState, fromStudy.selectEntities);

export const selectStudySearchRepliesAndEntities =
  createSelector(
    selectStudySearchActive,
    selectStudyLastSearch,
    selectStudySearchReplies,
    createSelector(selectStudyState, fromStudy.selectEntities),
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: PagedReplyEntityIds },
     entities: any): StudySearchReply => {
      if (searchActive || (lastSearch === null)) { return undefined; }

      const reply = searchReplies[lastSearch.queryString()];
      if (reply === undefined) { return undefined; }

      return {
        reply,
        studies: reply.entityIds.map(id => entities[id])
      };
    });

export const selectStudyLastAdded =
  createSelector(
    selectStudyLastAddedId,
    selectAllStudyEntities,
    (id: string, entities: { [id: string]: Study }): Study => {
      return entities[id];
    });

export const selectStudyEnableAllowed =
  createSelector(
    selectStudyEnableAllowedIds,
    (enableAllowedIds: string[], props: any): boolean =>
      enableAllowedIds.includes(props.studyId));
