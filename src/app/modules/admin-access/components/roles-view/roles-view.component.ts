import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockingProgressService } from '@app/core/services';
import { EntityStateInfo, LabelledId, PagedReplyInfo, SearchFilterValues } from '@app/domain';
import { Role } from '@app/domain/access';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { RootStoreState } from '@app/root-store';
import { RoleStoreActions, RoleStoreSelectors } from '@app/root-store/role';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-roles-view',
  templateUrl: './roles-view.component.html',
  styleUrls: ['./roles-view.component.scss']
})
export class RolesViewComponent implements OnInit, OnDestroy {
  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  rolePageInfo$: Observable<PagedReplyInfo<Role>>;

  rolesLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [name: string]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  roleToAdd: any;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private progressService: BlockingProgressService
  ) {
    this.filters = {
      nameFilter: new NameFilter(),
      stateFilter: new StateFilter(this.stateData, 'all', true)
    };

    this.sortChoices = [{ id: 'name', label: 'Name' }, { id: 'state', label: 'State' }];
  }

  ngOnInit() {
    this.store$
      .pipe(
        select(RoleStoreSelectors.selectRoleSearchActive),
        filter(active => !active),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.progressService.hide();
      });

    this.rolePageInfo$ = this.store$.pipe(
      select(RoleStoreSelectors.selectRoleSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

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

  public roleSelected(role: Role): void {
    this.router.navigate(['view', role.slug, 'summary'], { relativeTo: this.route });
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
      limit: this.rolesLimit
    };
    this.store$.dispatch(RoleStoreActions.searchRolesRequest({ searchParams }));
    this.progressService.show();
    this.progressService.message('Loading...');
  }
}
