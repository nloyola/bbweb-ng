import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import * as fromStudy from './study.reducer';
import { SearchParamsReply, SearchParams } from '@app/domain';
import { Study, StudySearchReply } from '@app/domain/studies';
import { PagedReply } from '@app/domain';

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

export const selectStudySearchReplies: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getSearchReplies);

export const selectAllStudies = createSelector(
  selectStudyState,
  fromStudy.selectEntities
);

export const selectStudySearchRepliesAndEntities =
  createSelector(
    selectStudySearchActive,
    selectStudyLastSearch,
    selectStudySearchReplies,
    selectAllStudies,
    (searchActive: boolean,
     lastSearch: SearchParams,
     searchReplies: { [ url: string ]: SearchParamsReply },
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
    (entities: { [id: string]: Study }, props: any): Study => {
      const found = Object.values(entities).find(s => s.slug === props.slug);
      if (found) {
        return found;
      }
      return undefined;
    });


export const selectStudyLastAdded =
  createSelector(
    selectStudyLastAddedId,
    selectAllStudies,
    (id: string, entities: { [id: string]: Study }): Study => {
      return entities[id];
    });
