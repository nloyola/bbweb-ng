import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState, EventStoreSelectors, EventStoreActions } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { Participant, CollectionEvent } from '@app/domain/participants';
import { VisitNumberFilter } from '@app/domain/search-filters';

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

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit() {
    this.isLoading$ =
      this.store$.pipe(select(EventStoreSelectors.selectCollectionEventSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(EventStoreSelectors.selectCollectionEventSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$));

    this.store$.pipe(
      select(EventStoreSelectors.selectCollectionEventLastRemovedId),
      filter(id => id !== null),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applySearchParams();
    });

   this.applySearchParams();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFiltersUpdated(filterValue: string) {
    const filter = new VisitNumberFilter();
    filter.setValue(filterValue)
    this.filterValues = filter.getValue();
    this.applySearchParams();
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
    this.store$.dispatch(EventStoreActions.searchEventsRequest({
      participant: this.participant,
      searchParams: new SearchParams(this.filterValues,
                                     this.sortField,
                                     this.currentPage,
                                     this.eventsLimit)
    }));
  }

}
