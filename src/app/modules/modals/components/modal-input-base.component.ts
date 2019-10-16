import { Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { ModalInputOptions } from '@app/modules/modals/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export class ModalInputBaseComponent<T> implements OnInit, OnDestroy {
  @Input() modal: NgbActiveModal;
  @Input() title: string;
  @Input() label: string;
  @Input() options: ModalInputOptions = {};
  @Input() value: T;

  form: FormGroup;
  modalInputValid = false;

  protected validators: ValidatorFn[] = [];
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(protected formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({ input: [this.value, this.validators] });

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.modalInputValid = !this.form.invalid;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get input(): AbstractControl {
    return this.form.get('input');
  }

  confirm(): void {
    this.modal.close(this.form.value.input);
  }

  dismiss(): void {
    this.modal.dismiss();
  }
}
