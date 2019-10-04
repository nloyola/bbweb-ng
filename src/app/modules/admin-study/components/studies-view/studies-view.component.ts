import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, PagedReplyInfo, SearchFilterValues } from '@app/domain';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import {
  Study,
  studyCountsToUIMap,
  StudyCountsUIMap,
  StudyState,
  StudyStateUIMap
} from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { RootStoreState, StudyStoreActions, StudyStoreSelectors } from '@app/root-store';
import {
  DropdownMenuItem,
  DropdownMenuDivider
} from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-studies-view',
  templateUrl: './studies-view.component.html',
  styleUrls: ['./studies-view.component.scss']
})
export class StudiesViewComponent implements OnInit, OnDestroy {
  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  studyCountData$: Observable<StudyCountsUIMap>;
  studyPageInfo$: Observable<PagedReplyInfo<Study>>;
  studies$: Observable<StudyUI[]>;
  studiesLimit = 5;
  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];
  currentPage = 1;
  studyToAdd: any;
  menuItems: DropdownMenuItem[];

  private filters: { [name: string]: SearchFilter };
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.stateData = Object.values(StudyState).map(state => ({
      id: state.toLowerCase(),
      label: StudyStateUIMap.get(state).stateLabel
    }));

    this.filters = {
      nameFilter: new NameFilter(),
      stateFilter: new StateFilter(this.stateData, 'all', true)
    };

    this.sortChoices = [{ id: 'name', label: 'Name' }, { id: 'state', label: 'State' }];
    this.menuItems = this.createSortMenuItems();
  }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(StudyStoreSelectors.selectStudiesSearchActive));

    this.studyCountData$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudyCounts),
      map(studyCountsToUIMap),
      takeUntil(this.unsubscribe$)
    );

    this.studyPageInfo$ = this.store$.pipe(
      select(StudyStoreSelectors.selectStudySearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.studies$ = this.studyPageInfo$.pipe(
      filter(page => page !== undefined),
      map(page => page.entities.map(e => new StudyUI(e)))
    );

    this.store$.dispatch(StudyStoreActions.getStudyCountsRequest());
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
    if (isNaN(page)) {
      return;
    }
    this.applySearchParams();
  }

  public studySelected(study: StudyUI): void {
    this.router.navigate([study.slug, 'summary'], { relativeTo: this.route });
  }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    const searchParams = {
      filter: this.getFilters().join(';'),
      sort: this.sortField,
      page: this.currentPage,
      limit: this.studiesLimit
    };
    this.store$.dispatch(StudyStoreActions.searchStudiesRequest({ searchParams }));
  }

  private createSortMenuItems(): DropdownMenuItem[] {
    const sortItems: DropdownMenuItem[] = this.sortChoices.map(sort => ({
      kind: 'selectable',
      label: sort.label,
      onSelected: () => {
        this.sortFieldSelected(sort.id);
      }
    }));
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Add Study',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.router.navigate(['/admin/studies/add']);
        }
      },
      DropdownMenuDivider,
      {
        kind: 'header',
        header: 'Sort By'
      },
      ...sortItems
    ];
    return items;
  }
}
