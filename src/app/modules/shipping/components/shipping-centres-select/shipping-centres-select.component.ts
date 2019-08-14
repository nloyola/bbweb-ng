import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { VisitNumberFilter, NameFilter } from '@app/domain/search-filters';
import {
  EventStoreActions,
  EventStoreSelectors,
  RootStoreState,
  CentreStoreSelectors,
  CentreStoreActions
} from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer } from 'rxjs';
import { filter, takeUntil, debounce, distinct } from 'rxjs/operators';
import { Centre } from '@app/domain/centres';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CourierNameFilter } from '@app/domain/search-filters/courier-name-filter.model';

@Component({
  selector: 'app-shipping-centres-select',
  templateUrl: './shipping-centres-select.component.html',
  styleUrls: ['./shipping-centres-select.component.scss']
})
export class ShippingCentresSelectComponent implements OnInit, OnDestroy {
  @Output() selected = new EventEmitter<Centre>();

  isLoading$: Observable<boolean>;

  pageInfo$: Observable<PagedReplyInfo<Centre>>;

  currentPage = 1;
  centresLimit = 5;
  sortField = 'name';
  filterForm: FormGroup;

  private filterValues = 'state::enabled';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(CentreStoreSelectors.selectCentreSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(CentreStoreSelectors.selectCentreSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

    this.filterForm = this.formBuilder.group({ name: [''] });

    // debounce the input to the name filter and then apply it to the search
    this.name.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        const f = new NameFilter();
        f.setValue(value);
        const filterValue = f.getValue();
        if (filterValue !== '') {
          this.filterValues = f.getValue() + ';state::enabled';
        } else {
          this.filterValues = 'state::enabled';
        }
        this.applySearchParams();
      });

    this.applySearchParams();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.filterForm.get('name');
  }

  public centreSelected(centre: Centre) {
    this.selected.emit(centre);
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
