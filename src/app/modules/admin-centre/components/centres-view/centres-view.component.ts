import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, PagedReplyInfo, SearchFilterValues, SearchParams } from '@app/domain';
import { Centre, centreCountsToUIMap, CentreCountsUIMap, CentreState, CentreStateUIMap } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-centres-view',
  templateUrl: './centres-view.component.html',
  styleUrls: ['./centres-view.component.scss']
})
export class CentresViewComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  centreCountData$: Observable<CentreCountsUIMap>;
  centrePageInfo$: Observable<PagedReplyInfo<Centre>>;

  centresLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];
  centres$: Observable<CentreUI[]>;

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

    this.centreCountData$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreCounts),
      takeUntil(this.unsubscribe$),
      map(centreCountsToUIMap));

    this.centrePageInfo$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      shareReplay());

    this.centres$ = this.centrePageInfo$.pipe(
      filter(page => page !== undefined),
      map(page => page.entities.map(e => new CentreUI(e))));

    this.store$.dispatch(CentreStoreActions.getCentreCountsRequest());
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

  public centreSelected(centre: CentreUI): void {
    this.router.navigate([ centre.slug, 'summary' ], { relativeTo: this.route });
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
}
