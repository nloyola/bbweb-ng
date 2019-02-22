import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState } from '@app/root-store';
import { EventTypeStoreActions, EventTypeStoreSelectors } from '@app/root-store/event-type';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SearchReply } from '@app/domain/search-reply.model';

@Component({
  selector: 'app-event-types-add-and-select',
  templateUrl: './event-types-add-and-select.component.html',
  styleUrls: ['./event-types-add-and-select.component.scss']
})
export class EventTypesAddAndSelectComponent implements OnInit, OnDestroy {

  @Input() study: Study;

  @Output() addSelected = new EventEmitter<any>();
  @Output() selected = new EventEmitter<CollectionEventType>();

  isLoading$: Observable<boolean>;
  pageInfo$: Observable<PagedReplyInfo<CollectionEventType>>;
  serverError$: Observable<boolean>;
  filterForm: FormGroup;
  isAddAllowed: boolean;

  currentPage = 1;
  eventTypesLimit = 5;
  sortField = 'name';

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit() {
    this.isAddAllowed = this.study.isDisabled();
    this.serverError$ = this.store$.pipe(select(EventTypeStoreSelectors.selectError));
    this.isLoading$ =
      this.store$.pipe(select(EventTypeStoreSelectors.selectSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(EventTypeStoreSelectors.selectSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    this.store$.pipe(
      select(EventTypeStoreSelectors.selectError),
      filter(error => error !== null),
      takeUntil(this.unsubscribe$))
      .subscribe(error => {
        if (error.actionType === EventTypeStoreActions.ActionTypes.SearchEventTypesFailure) {
          this.currentPage = 1;
          this.applySearchParams();
        }
      });

    // if event types change, then reload the current page
    this.store$.pipe(
      select(EventTypeStoreSelectors.selectAllEventTypes),
      takeUntil(this.unsubscribe$))
      .subscribe(() => {
        // do this even if there are no event types in the store
        this.applySearchParams();
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated(filterValues: string) {
    this.filterValues = filterValues;
    this.applySearchParams();
  }

  public getRecurringLabel(eventType: CollectionEventType) {
    return eventType.recurring ? 'Rec' : 'NonRec';
  }

  public eventTypeSelected(eventType: CollectionEventType) {
    this.selected.emit(eventType);
  }

  public paginationPageChange() {
    this.applySearchParams();
  }

  public add() {
    this.addSelected.emit(null);
  }

  private applySearchParams() {
    this.store$.dispatch(new EventTypeStoreActions.SearchEventTypesRequest({
      studySlug: this.study.slug,
      studyId: this.study.id,
      searchParams: new SearchParams(this.filterValues,
                                     this.sortField,
                                     this.currentPage,
                                     this.eventTypesLimit)
    }));
  }

  private searchReplyToPageInfo(
    searchReply: SearchReply<CollectionEventType>
  ): PagedReplyInfo<CollectionEventType> {
    if (searchReply === undefined) { return {} as any; }

    const result = {
      hasResultsToDisplay: searchReply.entities.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.entities.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.entities.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      entities: searchReply.entities,
      total: searchReply.reply.total,
      maxPages: searchReply.reply.maxPages,
      showPagination: searchReply.reply.maxPages > 1
    };
    return result;
  }

}
