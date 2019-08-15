import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PagedReplyInfo } from '@app/domain';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { VisitNumberFilter } from '@app/domain/search-filters';
import { EventStoreActions, EventStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, distinct, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-event-add-select',
  templateUrl: './event-add-select.component.html',
  styleUrls: ['./event-add-select.component.scss']
})
export class EventAddSelectComponent implements OnInit, OnDestroy {
  @Input() participant: Participant;
  @Output() addSelected = new EventEmitter<any>();
  @Output() selected = new EventEmitter<CollectionEvent>();

  isLoading$: Observable<boolean>;
  pageInfo$: Observable<PagedReplyInfo<CollectionEvent>>;

  currentPage = 1;
  eventsLimit = 5;
  sortField = 'visitNumber';
  filterForm: FormGroup;

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(EventStoreSelectors.selectCollectionEventSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(EventStoreSelectors.selectCollectionEventSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

    this.store$
      .pipe(
        select(EventStoreSelectors.selectCollectionEventLastRemovedId),
        filter(id => id !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.applySearchParams();
      });

    this.filterForm = this.formBuilder.group({ visitNumber: [''] });

    // debounce the input to the name filter and then apply it to the search
    this.visitNumber.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        const f = new VisitNumberFilter();
        f.setValue(value);
        this.filterValues = f.getValue();
        this.applySearchParams();
      });

    this.applySearchParams();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get visitNumber() {
    return this.filterForm.get('visitNumber');
  }

  public eventSelected(event: CollectionEvent) {
    this.selected.emit(event);
  }

  public paginationPageChange() {
    this.applySearchParams();
  }

  public add() {
    this.addSelected.emit(null);
  }

  private applySearchParams() {
    const searchParams = {
      filter: this.filterValues,
      sort: this.sortField,
      page: this.currentPage,
      limit: this.eventsLimit
    };
    this.store$.dispatch(
      EventStoreActions.searchEventsRequest({
        participant: this.participant,
        searchParams
      })
    );
  }
}
