import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, merge, timer } from 'rxjs';
import { debounce, distinct, map, takeUntil } from 'rxjs/operators';

import { EntityStateInfo, SearchFilterValues } from '@app/domain';

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
      .subscribe(value => {
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
