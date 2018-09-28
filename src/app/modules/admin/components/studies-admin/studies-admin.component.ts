import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import {
  Study,
  StudyCountInfo,
  StudySearchReply,
  StudyState,
  StudyStateUIMap,
  StudyCounts,
  studyCountsToUIMap,
  StudyCountsUIMap
} from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, tap, takeUntil } from 'rxjs/operators';

interface StudyPageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  studies?: StudyUI[];
  totalStudies?: number;
}

@Component({
  selector: 'app-studies-admin',
  templateUrl: './studies-admin.component.html',
  styleUrls: ['./studies-admin.component.scss']
})
export class StudiesAdminComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  studyCountData$: Observable<StudyCountsUIMap>;
  studyPageInfo$: Observable<StudyPageInfo>;

  studiesLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [ name: string]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {
    this.stateData = Object.values(StudyState).map(state => ({
      id: state.toLowerCase(),
      label: StudyStateUIMap.get(state).stateLabel
    }));

    this.filters = {
      nameFilter: new NameFilter(),
      stateFilter: new StateFilter(this.stateData, 'all', true)
    };

    this.sortChoices = [
      { id: 'name', label: 'Name' },
      { id: 'state', label: 'State' }
    ];
  }

  ngOnInit() {
    this.isLoading$ =
      this.store$.pipe(select(StudyStoreSelectors.selectStudySearchActive));

    this.serverError$ = this.store$.pipe(select(StudyStoreSelectors.selectStudyError));

    this.studyCountData$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudyCounts),
      takeUntil(this.unsubscribe$),
      map(studyCountsToUIMap));

    this.studyPageInfo$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(this.searchReplyToPageInfo));

    this.store$.dispatch(new StudyStoreActions.GetStudyCountsRequest());
    this.applySearchParams();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated($event: SearchFilterValues) {
    this.currentPage = 1;
    if ($event.name) {
      this.filters.nameFilter.setValue($event.name);
    }
    if ($event.stateId) {
      this.filters.stateFilter.setValue($event.stateId);
    }
    this.applySearchParams();
  }

  public sortFieldSelected(sortChoice) {
    this.currentPage = 1;
    this.sortField = sortChoice;
    this.applySearchParams();
  }

  public paginationPageChanged($event) {
    if (isNaN($event)) { return; }
    this.applySearchParams();
  }

  public studySelected($event: Study) {
    this.router.navigate([ '/admin/studies/view', $event.slug ]);
 }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new StudyStoreActions.SearchStudiesRequest({
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     5)
    }));
  }

  private searchReplyToPageInfo(searchReply: StudySearchReply): StudyPageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.studies.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.studies.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.studies.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      studies: searchReply.studies.map(s => new StudyUI(s)),
      totalStudies: searchReply.reply.total
    };
  }
}
