import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, timer } from 'rxjs';
import { debounce, distinct, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filter-value-input',
  templateUrl: './filter-value-input.component.html',
  styleUrls: ['./filter-value-input.component.scss']
})
export class FilterValueInputComponent implements OnInit, OnDestroy {
  @Output() valueChanged = new EventEmitter<string>();

  filterForm: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.filterForm = this.formBuilder.group({ value: [''] });

    // debounce the input to the name filter and then apply it to the search
    this.value.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        this.valueChanged.emit(value);
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get value() {
    return this.filterForm.get('value');
  }
}
