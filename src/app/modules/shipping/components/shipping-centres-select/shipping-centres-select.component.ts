import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NotificationService } from '@app/core/services/notification.service';
import { PagedReplyInfo } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { NameFilter } from '@app/domain/search-filters';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipping-centres-select',
  templateUrl: './shipping-centres-select.component.html',
  styleUrls: ['./shipping-centres-select.component.scss']
})
export class ShippingCentresSelectComponent implements OnInit, OnDestroy {
  @Output() onSelected = new EventEmitter<Centre>();

  isLoading$: Observable<boolean>;
  pageInfo$: Observable<PagedReplyInfo<Centre>>;
  currentPage = 1;
  centresLimit = 5;
  sortField = 'name';

  private filterValues = 'state::enabled';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(CentreStoreSelectors.selectCentreSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(error => !!error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        this.notificationService.showError(errMessage);
      });

    this.applySearchParams();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public nameFilterChanged(value: string) {
    const f = new NameFilter();
    f.setValue(value);
    const filterValue = f.getValue();
    if (filterValue !== '') {
      this.filterValues = f.getValue() + ';state::enabled';
    } else {
      this.filterValues = 'state::enabled';
    }
    this.applySearchParams();
  }

  public centreSelected(centre: Centre) {
    this.onSelected.emit(centre);
  }

  public paginationPageChange() {
    this.applySearchParams();
  }

  private applySearchParams() {
    const searchParams = {
      filter: this.filterValues,
      sort: this.sortField,
      page: this.currentPage,
      limit: this.centresLimit
    };
    this.store$.dispatch(CentreStoreActions.searchCentresRequest({ searchParams }));
  }
}
