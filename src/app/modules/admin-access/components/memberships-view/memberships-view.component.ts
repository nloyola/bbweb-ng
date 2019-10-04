import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityStateInfo, LabelledId, PagedReplyInfo, SearchFilterValues } from '@app/domain';
import { Membership } from '@app/domain/access';
import { NameFilter, SearchFilter, StateFilter } from '@app/domain/search-filters';
import { RootStoreState } from '@app/root-store';
import { MembershipStoreActions, MembershipStoreSelectors } from '@app/root-store/membership';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-memberships-view',
  templateUrl: './memberships-view.component.html',
  styleUrls: ['./memberships-view.component.scss']
})
export class MembershipsViewComponent implements OnInit, OnDestroy {
  isCountsLoading$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  hasLoaded$: Observable<boolean>;
  membershipPageInfo$: Observable<PagedReplyInfo<Membership>>;
  membershipsLimit = 5;
  sortField: string;
  stateData: EntityStateInfo[];
  currentPage = 1;
  membershipToAdd: any;
  menuItems: DropdownMenuItem[];

  private filters: { [name: string]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filters = {
      nameFilter: new NameFilter(),
      stateFilter: new StateFilter(this.stateData, 'all', true)
    };

    this.menuItems = this.createMenuItems();
  }

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(MembershipStoreSelectors.selectMembershipSearchActive));

    this.membershipPageInfo$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectMembershipSearchRepliesAndEntities),
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

  public membershipSelected(membership: Membership): void {
    this.router.navigate(['view', membership.slug, 'summary'], { relativeTo: this.route });
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
      limit: this.membershipsLimit
    };
    this.store$.dispatch(MembershipStoreActions.searchMembershipsRequest({ searchParams }));
  }

  private createMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Add Membership',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.router.navigate(['/admin/access/memberships/add']);
        }
      }
    ];
    return items;
  }
}
