import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { centreCountsToUIMap, CentreCountsUIMap, CentreSearchReply, CentreState, CentreStateUIMap } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

interface CentrePageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  centres?: CentreUI[];
  totalCentres?: number;
}

@Component({
  selector: 'app-centres-view',
  templateUrl: './centres-view.component.html',
  styleUrls: ['./centres-view.component.scss']
})
export class CentresViewComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  centreCountData$: Observable<CentreCountsUIMap>;
  centrePageInfo$: Observable<CentrePageInfo>;

  centresLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [ name: string ]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  centreToAdd: any;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.stateData = Object.values(CentreState).map(state => ({
      id: state.toLowerCase(),
      label: CentreStateUIMap.get(state).stateLabel
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
      this.store$.pipe(select(CentreStoreSelectors.selectCentreSearchActive));

    this.serverError$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreError),
      filter(e => (e !== null) && (e.type === CentreStoreActions.ActionTypes.SearchCentresFailure)));

    this.centreCountData$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreCounts),
      takeUntil(this.unsubscribe$),
      map(centreCountsToUIMap));

    this.centrePageInfo$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    this.store$.dispatch(new CentreStoreActions.GetCentreCountsRequest());
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

  public sortFieldSelected(sortChoice: string) {
    this.currentPage = 1;
    this.sortField = sortChoice;
    this.applySearchParams();
  }

  public paginationPageChanged(page: number) {
    if (isNaN(page)) { return; }
    this.applySearchParams();
  }

  public centreSelected(centre: CentreUI): void {
    this.router.navigate([ 'view', centre.slug, 'summary' ], { relativeTo: this.route });
 }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new CentreStoreActions.SearchCentresRequest({
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.centresLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: CentreSearchReply): CentrePageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.centres.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.centres.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.centres.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      centres: searchReply.centres.map(s => new CentreUI(s)),
      totalCentres: searchReply.reply.total
    };
  }
}
