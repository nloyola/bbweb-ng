import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { ModalInputComponent } from '../modal-input.component';

@Component({
  selector: 'app-modal-input-text',
  templateUrl: './modal-input-text.component.html',
  styleUrls: ['./modal-input-text.component.scss']
})
export class ModalInputTextComponent extends ModalInputComponent<string> {
  @Input() options: ModalInputTextOptions;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    if (this.options.required) {
      this.addValidators(Validators.required);
    }

    if (this.options.minLength) {
      this.validators.push(Validators.minLength(this.options.minLength));
    }

    super.ngOnInit();
  }
}
