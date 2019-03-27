import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { userCountsToUIMap, UserCountsUIMap, UserState, UserStateUIMap, User } from '@app/domain/users';
import { UserUI } from '@app/domain/users/user-ui.model';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SearchReply } from '@app/domain/search-reply.model';

interface UserPageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  users?: UserUI[];
  totalUsers?: number;
}

@Component({
  selector: 'app-users-view',
  templateUrl: './users-view.component.html',
  styleUrls: ['./users-view.component.scss']
})
export class UsersViewComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  userCountData$: Observable<UserCountsUIMap>;
  userPageInfo$: Observable<UserPageInfo>;

  usersLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [ name: string ]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  userToAdd: any;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.stateData = Object.values(UserState).map(state => ({
      id: state.toLowerCase(),
      label: UserStateUIMap.get(state).stateLabel
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
      this.store$.pipe(select(UserStoreSelectors.selectUserSearchActive));

    this.serverError$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserError),
      filter(e => (e !== null) && (e.type === UserStoreActions.UserActionTypes.SearchUsersFailure)));

    this.userCountData$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserCounts),
      takeUntil(this.unsubscribe$),
      map(userCountsToUIMap));

    this.userPageInfo$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    this.store$.dispatch(new UserStoreActions.GetUserCountsRequest());
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
    } else {
      this.filters.nameFilter.clearValue();
    }

    if (values.stateId !== undefined) {
      this.filters.stateFilter.setValue(values.stateId);
    } else {
      this.filters.stateFilter.clearValue();
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

  public userSelected(user: UserUI): void {
    this.router.navigate([ 'view', user.slug, 'summary' ], { relativeTo: this.route });
 }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new UserStoreActions.SearchUsersRequest({
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.usersLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: SearchReply<User>): UserPageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.entities.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.entities.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.entities.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      users: searchReply.entities.map(s => new UserUI(s)),
      totalUsers: searchReply.reply.total
    };
  }
}
