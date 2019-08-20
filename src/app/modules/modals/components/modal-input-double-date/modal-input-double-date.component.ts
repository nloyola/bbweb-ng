import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { ModalInputBaseComponent } from '../modal-input-base.component';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-input-double-date',
  templateUrl: './modal-input-double-date.component.html',
  styleUrls: ['./modal-input-double-date.component.scss']
})
export class ModalInputDoubleDateComponent extends ModalInputBaseComponent<Date>
  implements OnInit, OnDestroy {
  @Input() label2: string;
  @Input() date1value: Date;
  @Input() date2value: Date;

  faCalendar = faCalendar;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      date1: [this.date1value, this.validators],
      date2: [this.date2value, this.validators]
    });

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(values => {
        if (values.date1 !== undefined && values.date2 !== undefined) {
          this.modalInputValid = !this.form.errors;
        }
      });
  }

  get date1(): AbstractControl {
    return this.form.get('date1');
  }

  get date2(): AbstractControl {
    return this.form.get('date2');
  }

  confirm(): void {
    this.modal.close([this.form.value.date1, this.form.value.date2]);
  }
}
