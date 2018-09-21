import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest, merge } from 'rxjs';
import { catchError, filter, map, takeUntil, tap } from 'rxjs/operators';
import {
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';

import {
  StudyState,
  StudyCounts,
  Study,
  StudyCountInfo,
  StudySearchReply } from '@app/domain/studies';

import {
  SearchFilters,
  EntityStateInfo,
  LabelledId,
  SearchParamsReply,
  PagedReply,
  SearchParams } from '@app/domain';

import { NameFilter, StateFilter, SearchFilter } from '@app/domain/search-filters';

interface StudyIconData {
  icon?: string;
  iconClass?: string;
}

interface StudyPageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  studies?: Study[];
  totalStudies?: number;
}

@Component({
  selector: 'app-studies-admin',
  templateUrl: './studies-admin.component.html',
  styleUrls: ['./studies-admin.component.scss']
})
export class StudiesAdminComponent implements OnInit, OnDestroy {

  private studyIconData: { [ state: string ]: StudyIconData } = {
    disabled: { icon: 'settings', iconClass: 'warning-icon' },
    enabled: { icon: 'check_circle', iconClass: 'success-icon' },
    retired: { icon: 'remove_circle', iconClass: 'danger-icon' }
  };

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  studyCountData$: Observable<StudyCountInfo[]>;
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
    this.stateData = Object.keys(StudyState).map(state => ({
      id: state.toLowerCase(),
      label: state
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
    this.applySearchParams();

    this.isCountsLoading$ =
      this.store$.pipe(select(StudyStoreSelectors.selectStudyIsLoadingCounts));
    this.isLoading$ = this.store$.pipe(select(StudyStoreSelectors.selectStudyIsSearching));
    this.serverError$ = this.store$.pipe(select(StudyStoreSelectors.selectStudyError));
    this.hasLoaded$ = combineLatest(this.isLoading$, this.serverError$)
      .pipe(map(result => !result[0] && (result[1] === null)),
            // tap(v => console.log('tap2', v)),
            takeUntil(this.unsubscribe$));

    this.studyCountData$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudyCounts),
      filter(counts => Object.keys(counts).length !== 0),
      takeUntil(this.unsubscribe$),
      map(counts => [
        {
          label: 'Enabled',
          count: counts.enabledCount,
          ...this.studyIconData.enabled
        },
        {
          label: 'Disabled',
          count: counts.disabledCount,
          ...this.studyIconData.disabled
        },
        {
          label: 'Retired',
          count: counts.retiredCount,
          ...this.studyIconData.retired
        }
      ]));

    this.studyPageInfo$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
      // tap(v => console.log('tap', v)),
      takeUntil(this.unsubscribe$),
      map((searchReply: StudySearchReply) => {
        if (searchReply === undefined) { return {}; }

        return {
          hasResultsToDisplay: searchReply.studies.length > 0,
          hasNoEntitiesToDisplay: ((searchReply.studies.length <= 0)
                                   && (searchReply.reply.searchParams.filter === '')),

          hasNoResultsToDisplay: ((searchReply.studies.length <= 0)
                                  && (searchReply.reply.searchParams.filter !== '')),

          studies: searchReply.studies,
          totalStudies: searchReply.reply.total
        }
      }));

    this.store$.dispatch(new StudyStoreActions.GetStudyCountsRequest());
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated($event: SearchFilters) {
    this.currentPage = 1;
    this.filters.nameFilter.setValue($event.name);
    this.filters.stateFilter.setValue($event.stateId);
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

  private getItemIcon(study) {
    return this.studyIconData[study.state].icon;
  }

  private getItemIconClass(study) {
    return this.studyIconData[study.state].iconClass;
  }

}
