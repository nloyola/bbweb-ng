import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EntityStateInfo, SearchFilterValues } from '@app/domain';
import { merge, Subject, timer } from 'rxjs';
import { debounce, distinct, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-entity-filters',
  templateUrl: './entity-filters.component.html',
  styleUrls: ['./entity-filters.component.scss']
})
export class EntityFiltersComponent implements OnInit, OnDestroy {

  @Input() useNameFilter = false;
  @Input() useEmailFilter = false;
  @Input() stateData: EntityStateInfo[] = [];

  @Output() filters = new EventEmitter<SearchFilterValues>();

  form: FormGroup;
  multipleFilters: boolean;

  private hasStateFilter: boolean;
  private allStates: EntityStateInfo = {
    id: 'all',
    label: 'All'
  };

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        name: [''],
        email: [''],
        state: ['']
      });

    this.hasStateFilter = this.stateData && (this.stateData.length > 0);

    const filtersEnabledCount = (this.useNameFilter ? 1 : 0) +
      (this.useEmailFilter ? 1 : 0) +
      (this.hasStateFilter ? 1 : 0);

    if (filtersEnabledCount === 0) {
      throw new Error('no filters are enabled');
    }

    this.multipleFilters = filtersEnabledCount > 1;

    if (this.hasStateFilter) {
      // preppend array with a selection for all states
      this.stateData = [ this.allStates ].concat(this.stateData);
      this.form.controls.state.setValue(this.stateData[0].id);
    }

    merge(this.name.valueChanges,
          this.email.valueChanges,
          this.state.valueChanges)
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.form.value),
        takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const filters: SearchFilterValues = {};
        if (this.useNameFilter) {
          filters.name = this.form.value.name;
        }
        if (this.useEmailFilter) {
          filters.email = this.form.value.email;
        }
        if (this.hasStateFilter) {
          filters.stateId = this.form.value.state;
        }
        this.filters.emit(filters);
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get state() {
    return this.form.get('state');
  }

  clearFilters() {
    this.name.setValue('');
    this.email.setValue('');
    this.state.setValue(this.stateData[0].id);
  }

}
