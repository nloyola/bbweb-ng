import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { ProcessingType, Study } from '@app/domain/studies';
import { RootStoreState } from '@app/root-store';
import { ProcessingTypeStoreActions, ProcessingTypeStoreSelectors } from '@app/root-store/processing-type';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { SearchReply } from '@app/domain/search-reply.model';

export interface ProcessingTypePageInfo {
  hasNoEntitiesToDisplay: boolean;
  hasNoResultsToDisplay: boolean;
  hasResultsToDisplay: boolean;
  processingTypes: ProcessingType[];
  total: number;
  maxPages: number;
  showPagination: boolean;
}

@Component({
  selector: 'app-processing-types-add-and-select',
  templateUrl: './processing-types-add-and-select.component.html',
  styleUrls: ['./processing-types-add-and-select.component.scss']
})
export class ProcessingTypesAddAndSelectComponent implements OnInit, OnDestroy {

  @Input() study: Study;

  @Output() addSelected = new EventEmitter<any>();
  @Output() selected = new EventEmitter<ProcessingType>();

  isLoading$: Observable<boolean>;
  pageInfo$: Observable<PagedReplyInfo<ProcessingType>>;
  serverError$: Observable<boolean>;
  isAddAllowed: boolean;

  currentPage = 1;
  processingTypesLimit = 5;
  sortField = 'name';

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit() {
    this.isAddAllowed = this.study.isDisabled();

    this.isLoading$ =
      this.store$.pipe(select(ProcessingTypeStoreSelectors.selectSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      map(reply => this.searchReplyToPageInfo(reply)));

    this.serverError$ = this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectError),
      filter(error => error !== null),
      map(error => (error.actionType === ProcessingTypeStoreActions.ActionTypes.SearchProcessingTypesFailure)),
      tap(error => {
        if (error) {
          this.currentPage = 1;
          this.applySearchParams();
        }
      }));

    this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectLastRemovedId),
      filter(id => id !== null),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applySearchParams();
    });

    this.applySearchParams();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFiltersUpdated(filterValues: string) {
    this.filterValues = filterValues;
    this.applySearchParams();
  }

  public processingTypeSelected(processingType: ProcessingType) {
    this.selected.emit(processingType);
  }

  public paginationPageChange() {
    this.applySearchParams();
  }

  public add() {
    this.addSelected.emit(null);
  }

  private applySearchParams() {
    this.store$.dispatch(new ProcessingTypeStoreActions.SearchProcessingTypesRequest({
      studySlug: this.study.slug,
      studyId: this.study.id,
      searchParams: new SearchParams(this.filterValues,
                                     this.sortField,
                                     this.currentPage,
                                     this.processingTypesLimit)
    }));
  }

  private searchReplyToPageInfo(searchReply: SearchReply<ProcessingType>): PagedReplyInfo<ProcessingType> {
    if (searchReply === undefined) { return {} as any; }

    return {
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
  }

}
