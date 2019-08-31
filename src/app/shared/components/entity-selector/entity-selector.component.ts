import { NgForOfContext } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  Output,
  TemplateRef,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomainEntity, PagedReplyInfo } from '@app/domain';
import { NameFilter, SearchFilter } from '@app/domain/search-filters';
import { Subject, timer } from 'rxjs';
import { debounce, distinct, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-entity-selector',
  templateUrl: './entity-selector.component.html',
  styleUrls: ['./entity-selector.component.scss']
})
export class EntitySelectorComponent<T extends DomainEntity> implements OnInit, OnDestroy, OnChanges {
  @Input() entities: T[];
  @Input() isLoading: boolean;
  @Input() entitiesLimit: number;
  @Input() page: number;
  @Input() hasNoMatches: boolean;

  @Input() heading: TemplateRef<any>;
  @Input() noEntitiesToDisplay: TemplateRef<any>;
  @Input() noResultsToDisplay: TemplateRef<any>;
  @Input() loadingContent: TemplateRef<any>;

  @ContentChild(TemplateRef, { static: true }) entityTemplate: TemplateRef<NgForOfContext<T>>;

  @Output() nameFilterUpdated = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  filterForm: FormGroup;
  hasNoEntitiesToDisplay: boolean;
  hasNoResultsToDisplay: boolean;
  hasResultsToDisplay: boolean;

  private filters: { [name: string]: SearchFilter };
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {
    this.hasNoResultsToDisplay = false;
    this.filters = {
      nameFilter: new NameFilter()
    };
  }

  ngOnInit() {
    this.hasNoEntitiesToDisplay = this.entities !== null && this.entities.length > 0;
    this.hasResultsToDisplay = !this.hasNoEntitiesToDisplay && !this.hasNoMatches;

    this.filterForm = this.formBuilder.group({ name: [''] });

    // debounce the input to the name filter and then apply it to the search
    this.name.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.filters.nameFilter.setValue(this.filterForm.value.name);
        this.nameFilterUpdated.emit(this.getFilters().join(';'));
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasNoMatches) {
      this.hasNoMatches = changes.hasNoMatches.currentValue;
      this.hasNoResultsToDisplay = !this.hasNoMatches;
    }
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.filterForm.get('name');
  }

  public paginationPageChange(newPage: number) {
    if (isNaN(newPage)) {
      return;
    }
    this.pageChange.emit(newPage);
  }

  private getFilters() {
    return Object.values(this.filters)
      .map(f => f.getValue())
      .filter(value => value !== '');
  }
}
