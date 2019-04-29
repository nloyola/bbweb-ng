import { PagedReplyEntityIds, PagedReplyInfo, pagedReplyToInfo, SearchParams } from '@app/domain';
import { Study, StudyCounts } from '@app/domain/studies';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromStudy from './study.reducer';

export const getLastAddedId = (state: fromStudy.State): string => state.lastAddedId;

export const getSearchActive = (state: fromStudy.State): boolean => state.searchState.searchActive;

export const getLastSearch = (state: fromStudy.State): SearchParams => state.searchState.lastSearch;

export const getSearchReplies =
  (state: fromStudy.State): { [ url: string ]: PagedReplyEntityIds } => state.searchState.searchReplies;

export const getCollectionStudiesSearchActive =
  (state: fromStudy.State): boolean => state.searchCollectionStudiesState.searchActive;

export const getCollectionStudiesLastSearch =
  (state: fromStudy.State): SearchParams => state.searchCollectionStudiesState.lastSearch;

export const getCollectionStudiesSearchReplies =
  (state: fromStudy.State): { [ url: string ]: string[] } =>
  state.searchCollectionStudiesState.searchReplies;

export const getCounts = (state: fromStudy.State): StudyCounts => state.studyCounts;

export const getEnableAllowedIds =
  (state: fromStudy.State): fromStudy.EnableAllowdIds => state.enableAllowedIds;

export const getError = (state: fromStudy.State): any => state.error;

export const selectStudyState = createFeatureSelector<fromStudy.State>('study');

export const selectStudyLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectStudyState, getLastAddedId);

export const selectStudiesSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getSearchActive);

export const selectStudiesLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectStudyState, getLastSearch);

export const selectStudiesSearchReplies: MemoizedSelector<object, { [ url: string ]: PagedReplyEntityIds }> =
  createSelector(selectStudyState, getSearchReplies);

export const selectCollectionStudiesSearchActive: MemoizedSelector<object, boolean> =
  createSelector(selectStudyState, getCollectionStudiesSearchActive);

export const selectCollectionStudiesLastSearch: MemoizedSelector<object, SearchParams> =
  createSelector(selectStudyState, getCollectionStudiesLastSearch);

export const selectCollectionStudiesSearchReplies: MemoizedSelector<object, { [ url: string ]: string[] }> =
  createSelector(selectStudyState, getCollectionStudiesSearchReplies);

export const selectStudyError: MemoizedSelector<object, any> =
  createSelector(selectStudyState, getError);

export const selectStudyCounts: MemoizedSelector<object, StudyCounts> =
  createSelector(selectStudyState, getCounts);

export const selectStudyEnableAllowedIds: MemoizedSelector<object, fromStudy.EnableAllowdIds> =
  createSelector(selectStudyState, getEnableAllowedIds);

export const selectAllStudies: MemoizedSelector<object, Study[]> =
  createSelector(selectStudyState, fromStudy.selectAll);

export const selectAllStudyEntities =
  createSelector(selectStudyState, fromStudy.selectEntities);

function searchToEntities(
  searchActive: boolean,
  lastSearch: SearchParams,
  searchReplies: { [ url: string ]: PagedReplyEntityIds },
  entities: any
): PagedReplyInfo<Study> {
  if (searchActive || (lastSearch === null)) { return undefined; }

  const reply = searchReplies[lastSearch.queryString()];
  if (reply === undefined) { return undefined; }

  const info = pagedReplyToInfo(reply);
  return {
    ...info,
    entities: reply.entityIds.map(id => entities[id])
  };
}

export const selectStudySearchRepliesAndEntities =
  createSelector(
    selectStudiesSearchActive,
    selectStudiesLastSearch,
    selectStudiesSearchReplies,
    createSelector(selectStudyState, fromStudy.selectEntities),
    searchToEntities);

function collectionStudiesSearchToEntities(
  searchActive: boolean,
  lastSearch: SearchParams,
  searchReplies: { [ url: string ]: string[] },
  entities: any
): Study[] {
  if (searchActive || (lastSearch === null)) { return undefined; }

  const studyIds = searchReplies[lastSearch.queryString()];
  if (studyIds === undefined) { return undefined; }

  return studyIds.map(id => entities[id]);
}

export const selectCollectionStudiesSearchRepliesAndEntities =
  createSelector(
    selectCollectionStudiesSearchActive,
    selectCollectionStudiesLastSearch,
    selectCollectionStudiesSearchReplies,
    createSelector(selectStudyState, fromStudy.selectEntities),
    collectionStudiesSearchToEntities);

export const selectStudyLastAdded =
  createSelector(
    selectStudyLastAddedId,
    selectAllStudyEntities,
    (id: string, entities: { [id: string]: Study }): Study => {
      return entities[id];
    });
