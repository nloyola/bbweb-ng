import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { studyCountsToUIMap, StudyCountsUIMap, StudyState, StudyStateUIMap, Study } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SearchReply } from '@app/domain/search-reply.model';

interface StudyPageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  studies?: StudyUI[];
  totalStudies?: number;
}

@Component({
  selector: 'app-studies-view',
  templateUrl: './studies-view.component.html',
  styleUrls: ['./studies-view.component.scss']
})
export class StudiesViewComponent implements OnInit, OnDestroy {

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

  private filters: { [ name: string ]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  studyToAdd: any;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
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

    this.serverError$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudyError),
      filter(e => (e !== null) && (e.type === StudyStoreActions.ActionTypes.SearchStudiesFailure)));

    this.studyCountData$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudyCounts),
      takeUntil(this.unsubscribe$),
      map(studyCountsToUIMap));

    this.studyPageInfo$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    this.store$.dispatch(new StudyStoreActions.GetStudyCountsRequest());
    this.applySearchParams();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated(values: SearchFilterValues) {
    this.currentPage = 1;
    if (values.name !== undefined) {
      this.filters.nameFilter.setValue(values.name);
    }
    if (values.stateId !== undefined) {
      this.filters.stateFilter.setValue(values.stateId);
    }
    this.applySearchParams();
  }

  public sortFieldSelected(sortChoice: string) {
    this.currentPage = 1;
    this.sortField = sortChoice;
    this.applySearchParams();
  }

  public paginationPageChanged(page: number) {
    if (isNaN(page)) { return; }
    this.applySearchParams();
  }

  public studySelected(study: StudyUI): void {
    this.router.navigate([ study.slug, 'summary' ], { relativeTo: this.route });
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
                                     this.studiesLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: SearchReply<Study>): StudyPageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.entities.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.entities.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.entities.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      studies: searchReply.entities.map(s => new StudyUI(s)),
      totalStudies: searchReply.reply.total
    };
  }
}
