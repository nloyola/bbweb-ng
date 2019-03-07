import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ModalInputResult, ModalInputTextOptions } from '@app/modules/modals/models';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-input-text',
  templateUrl: './modal-input-text.component.html',
  styleUrls: ['./modal-input-text.component.scss']
})
export class ModalInputTextComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() label: string;
  @Input() value: string;
  @Input() options: ModalInputTextOptions;
  @Input() modalClose: (result: ModalInputResult) => void;

  modalInputValid = false;

  protected modalInputForm: FormGroup;
  protected validators: ValidatorFn[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder) { }

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

  close(): (result: any) => void {
    return (source: any): void => {
      const result = {
        confirmed: (source === 'OK'),
        value: this.modalInputForm.value.text,
      };
      this.modalClose(result);
    };
  }

}
