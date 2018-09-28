import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Study, StudySearchReply } from '@app/domain/studies';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromStudy from './study.reducer';

export const getLastAddedId = (state: fromStudy.State): any => state.lastAddedId;

export const getSearchActive = (state: fromStudy.State): any => state.searchActive;

export const getLastSearch = (state: fromStudy.State): any => state.lastSearch;

export const getError = (state: fromStudy.State): any => state.error;

export const getSearchReplies = (state: fromStudy.State): any => state.searchReplies;

export const getCounts = (state: fromStudy.State): any => state.studyCounts;

export const selectStudyState = createFeatureSelector<fromStudy.State>('study');

export const selectStudyLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectStudyState, getLastAddedId);

export const selectStudySearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getSearchActive);

export const selectStudyLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectStudyState, getLastSearch);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);

export const selectStudyCounts: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getCounts);

export const selectStudySearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectStudyState, getSearchReplies);

export const selectAllStudies = createSelector(
  selectStudyState,
  fromStudy.selectAll
);

export const selectAllStudyEntities = createSelector(
  selectStudyState,
  fromStudy.selectEntities
);

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

export const selectStudyBySlug =
  createSelector(
    selectAllStudies,
    (studies: Study[], props: any): Study => {
      return studies.find(s => s.slug === props.slug);
    });

export const selectStudyLastAdded =
  createSelector(
    selectStudyLastAddedId,
    selectAllStudyEntities,
    (id: string, entities: { [id: string]: Study }): Study => {
      return entities[id];
    });
