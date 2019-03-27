import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { RoleStoreSelectors, RoleStoreActions } from '@app/root-store/role';
import { SearchReply } from '@app/domain/search-reply.model';

interface RolePageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  roles?: Role[];
  total?: number;
}

@Component({
  selector: 'app-roles-view',
  templateUrl: './roles-view.component.html',
  styleUrls: ['./roles-view.component.scss']
})
export class RolesViewComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  rolePageInfo$: Observable<RolePageInfo>;

  rolesLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [ name: string ]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  roleToAdd: any;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
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
      this.store$.pipe(select(RoleStoreSelectors.selectRoleSearchActive));

    this.serverError$ = this.store$.pipe(
      select(RoleStoreSelectors.selectRoleError),
      filter(e => (e !== null) && (e.type === RoleStoreActions.RoleActionTypes.SearchRolesFailure)));

    this.rolePageInfo$ = this.store$.pipe(
      select(RoleStoreSelectors.selectRoleSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

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
    if (isNaN(page)) { return; }
    this.applySearchParams();
  }

  public roleSelected(role: Role): void {
    this.router.navigate([ 'view', role.slug, 'summary' ], { relativeTo: this.route });
 }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new RoleStoreActions.SearchRolesRequest({
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.rolesLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: SearchReply<Role>): RolePageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.entities.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.entities.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.entities.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),
      roles: searchReply.entities,
      total: searchReply.reply.total
    };
  }
}
