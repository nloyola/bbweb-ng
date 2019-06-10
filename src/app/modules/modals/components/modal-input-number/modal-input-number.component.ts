import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-input-number',
  templateUrl: './modal-input-number.component.html',
  styleUrls: ['./modal-input-number.component.scss']
})
export class ModalInputNumberComponent implements OnInit, OnDestroy {

  @Input() modal: NgbActiveModal;
  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() options: ModalInputTextOptions;

  modalInputValid = false;

  protected modalInputForm: FormGroup;
  protected validators: ValidatorFn[] = [];
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(protected formBuilder: FormBuilder) { }

  ngOnInit() {
    if (this.options.required) {
      this.validators.push(Validators.required);
    }

    if (this.options.minLength) {
      this.validators.push(Validators.minLength(this.options.minLength));
    }

    this.modalInputForm = this.formBuilder.group({ text: [this.value, this.validators] });

    this.modalInputForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.modalInputValid = !this.modalInputForm.errors;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get text(): AbstractControl {
    return this.modalInputForm.get('text');
  }

  confirm(): void {
    this.modal.close(this.modalInputForm.value.text);
  }

  dismiss(): void {
    this.modal.dismiss();
  }

}
