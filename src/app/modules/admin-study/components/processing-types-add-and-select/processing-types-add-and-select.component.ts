import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PagedReplyInfo } from '@app/domain';
import { NameFilter } from '@app/domain/search-filters';
import { ProcessingType, Study } from '@app/domain/studies';
import { RootStoreState } from '@app/root-store';
import { ProcessingTypeStoreActions, ProcessingTypeStoreSelectors } from '@app/root-store/processing-type';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
  isAddAllowed: boolean;
  currentPage = 1;
  processingTypesLimit = 5;
  sortField = 'name';
  menuItems: DropdownMenuItem[];

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {
    this.menuItems = [
      {
        kind: 'selectable',
        label: 'Add Step',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.addSelected.emit(null);
        }
      }
    ];
  }

  ngOnInit() {
    this.isAddAllowed = this.study.isDisabled();

    this.isLoading$ = this.store$.pipe(select(ProcessingTypeStoreSelectors.selectSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

    this.store$
      .pipe(
        select(ProcessingTypeStoreSelectors.selectLastRemovedId),
        filter(id => id !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.applySearchParams();
      });

    this.applySearchParams();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public nameFilterChanged(value: string) {
    const f = new NameFilter();
    f.setValue(value);
    this.filterValues = f.getValue();
    this.applySearchParams();
  }

  public onFiltersUpdated(filterValue: string) {
    const f = new NameFilter();
    f.setValue(filterValue);
    this.filterValues = f.getValue();
    this.applySearchParams();
  }

  public processingTypeSelected(processingType: ProcessingType) {
    this.selected.emit(processingType);
  }

  public paginationPageChange() {
    this.applySearchParams();
  }

  private applySearchParams() {
    const searchParams = {
      filter: this.filterValues,
      sort: this.sortField,
      page: this.currentPage,
      limit: this.processingTypesLimit
    };
    this.store$.dispatch(
      new ProcessingTypeStoreActions.SearchProcessingTypesRequest({
        studySlug: this.study.slug,
        studyId: this.study.id,
        searchParams
      })
    );
  }
}
