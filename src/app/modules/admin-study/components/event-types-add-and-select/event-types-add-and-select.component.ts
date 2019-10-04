import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PagedReplyInfo } from '@app/domain';
import { NameFilter } from '@app/domain/search-filters';
import { CollectionEventType, Study } from '@app/domain/studies';
import { RootStoreState } from '@app/root-store';
import { EventTypeStoreActions, EventTypeStoreSelectors } from '@app/root-store/event-type';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
  isAddAllowed: boolean;
  currentPage = 1;
  eventTypesLimit = 5;
  sortField = 'name';
  menuItems: DropdownMenuItem[];

  private filterValues = '';
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {
    this.menuItems = [
      {
        kind: 'selectable',
        label: 'Add Event',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.add();
        }
      }
    ];
  }

  ngOnInit() {
    this.isAddAllowed = this.study.isDisabled();
    this.isLoading$ = this.store$.pipe(select(EventTypeStoreSelectors.selectSearchActive));

    this.pageInfo$ = this.store$.pipe(
      select(EventTypeStoreSelectors.selectSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$)
    );

    this.store$
      .pipe(
        select(EventTypeStoreSelectors.selectLastRemovedId),
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
    const searchParams = {
      filter: this.filterValues,
      sort: this.sortField,
      page: this.currentPage,
      limit: this.eventTypesLimit
    };
    this.store$.dispatch(
      EventTypeStoreActions.searchEventTypesRequest({
        studySlug: this.study.slug,
        studyId: this.study.id,
        searchParams
      })
    );
  }
}
