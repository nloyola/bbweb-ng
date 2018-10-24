import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { studyCountsToUIMap, StudyCountsUIMap, StudySearchReply, StudyState, StudyStateUIMap, Study } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { StudyAddComponent } from '../study-add/study-add.component';

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
export class StudiesViewComponent implements OnInit {
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
  studyToAdd: any;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
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

  public studySelected($event: StudyUI) {
    this.router.navigate([ 'view', $event.slug, 'summary' ], { relativeTo: this.route });
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
