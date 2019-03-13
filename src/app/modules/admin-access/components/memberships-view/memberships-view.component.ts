import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, SearchFilterValues, SearchParams } from '@app/domain';
import { Membership } from '@app/domain/access';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { MembershipStoreSelectors, MembershipStoreActions } from '@app/root-store/membership';
import { SearchReply } from '@app/domain/search-reply.model';

interface MembershipPageInfo {
  hasNoEntitiesToDisplay?: boolean;
  hasNoResultsToDisplay?: boolean;
  hasResultsToDisplay?: boolean;
  memberships?: Membership[];
  total?: number;
}

@Component({
  selector: 'app-memberships-view',
  templateUrl: './memberships-view.component.html',
  styleUrls: ['./memberships-view.component.scss']
})
export class MembershipsViewComponent implements OnInit, OnDestroy {

  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  serverError$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  membershipPageInfo$: Observable<MembershipPageInfo>;

  membershipsLimit = 5;

  sortField: string;
  stateData: EntityStateInfo[];
  sortChoices: LabelledId[];

  private filters: { [ name: string ]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  currentPage = 1;
  membershipToAdd: any;

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
      this.store$.pipe(select(MembershipStoreSelectors.selectMembershipSearchActive));

    this.serverError$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectMembershipError),
      filter(e => (e !== null)
             && (e.type === MembershipStoreActions.MembershipActionTypes.SearchMembershipsFailure)));

    this.membershipPageInfo$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectMembershipSearchRepliesAndEntities),
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

  public membershipSelected(membership: Membership): void {
    this.router.navigate([ 'view', membership.slug, 'summary' ], { relativeTo: this.route });
 }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new MembershipStoreActions.SearchMembershipsRequest({
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.membershipsLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: SearchReply<Membership>): MembershipPageInfo {
    if (searchReply === undefined) { return {}; }

    return {
      hasResultsToDisplay: searchReply.entities.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.entities.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.entities.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),
      memberships: searchReply.entities,
      total: searchReply.reply.total
    };
  }
}
