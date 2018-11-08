import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer } from 'rxjs';
import { EventTypeStoreSelectors, EventTypeStoreActions } from '@app/root-store/event-type';
import { filter, map, takeUntil, debounce, distinct } from 'rxjs/operators';
import { EventTypeSearchReply, CollectionEventType, Study } from '@app/domain/studies';
import { SearchParams, SearchFilterValues } from '@app/domain';
import { SearchFilter, NameFilter } from '@app/domain/search-filters';
import { FormBuilder, FormGroup } from '@angular/forms';

interface EventTypePageInfo {
  hasNoEntitiesToDisplay: boolean;
  hasNoResultsToDisplay: boolean;
  hasResultsToDisplay: boolean;
  eventTypes: CollectionEventType[];
  total: number;
  maxPages: number;
  showPagination: boolean;
}

@Component({
  selector: 'app-event-types-add-and-select',
  templateUrl: './event-types-add-and-select.component.html',
  styleUrls: ['./event-types-add-and-select.component.scss']
})
export class EventTypesAddAndSelectComponent implements OnInit, OnDestroy {

  @Output() addSelected = new EventEmitter<any>();
  @Output() selected = new EventEmitter<CollectionEventType>();

  isLoading$: Observable<boolean>;
  pageInfo$: Observable<EventTypePageInfo>;
  serverError$: Observable<boolean>;
  filterForm: FormGroup;
  isAddAllowed: boolean;

  currentPage = 1;
  eventTypesLimit = 5;
  sortField = 'name';

  private study: Study;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private filters: { [ name: string]: SearchFilter };

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) {

    this.filters = {
      nameFilter: new NameFilter()
    };
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({ name: [''] });

    this.study = this.route.parent.parent.snapshot.data.study;
    this.isAddAllowed = this.study.isDisabled();

    this.serverError$ = this.store$.pipe(select(EventTypeStoreSelectors.selectError));

    this.isLoading$ =
      this.store$.pipe(select(EventTypeStoreSelectors.selectSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(EventTypeStoreSelectors.selectSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    // debounce the input to the name filter and then apply it to the search
    this.name.valueChanges.pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.filters.nameFilter.setValue(this.filterForm.value.name);
        this.applySearchParams();
      });

    // if event types change, then reload the current page
    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectAllEventTypes),
        filter((eventTypes: CollectionEventType[]) => !!eventTypes),
        takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.applySearchParams();
      });

    this.applySearchParams();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated($event: SearchFilterValues) {
    this.currentPage = 1;
    if ($event.name) {
      this.filters.nameFilter.setValue($event.name);
    }
    this.applySearchParams();
  }

  public getRecurringLabel(eventType) {
    return eventType.recurring ? 'Rec' : 'NonRec';
  }

  public eventTypeSelected(eventType) {
    this.selected.emit(eventType);
  }

  public paginationPageChanged($event) {
    if (isNaN($event)) { return; }
    this.applySearchParams();
  }

  get name() {
    return this.filterForm.get('name');
  }

  public add() {
    this.addSelected.emit(null);
  }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }

  private applySearchParams() {
    this.store$.dispatch(new EventTypeStoreActions.SearchEventTypesRequest({
      studySlug: this.study.slug,
      searchParams: new SearchParams(this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.eventTypesLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: EventTypeSearchReply): EventTypePageInfo {
    if (searchReply === undefined) { return undefined; }

    return {
      hasResultsToDisplay: searchReply.eventTypes.length > 0,
      hasNoEntitiesToDisplay: ((searchReply.eventTypes.length <= 0)
                               && (searchReply.reply.searchParams.filter === '')),

      hasNoResultsToDisplay: ((searchReply.eventTypes.length <= 0)
                              && (searchReply.reply.searchParams.filter !== '')),

      eventTypes: searchReply.eventTypes,
      total: searchReply.reply.total,
      maxPages: searchReply.reply.maxPages,
      showPagination: searchReply.reply.maxPages > 1
    };
  }

}
