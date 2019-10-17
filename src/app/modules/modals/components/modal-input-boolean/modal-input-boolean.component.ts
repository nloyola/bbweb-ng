import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalInputComponent } from '../modal-input.component';

@Component({
  selector: 'app-modal-input-boolean',
  templateUrl: './modal-input-boolean.component.html',
  styleUrls: ['./modal-input-boolean.component.scss']
})
export class ModalInputBooleanComponent extends ModalInputComponent<boolean> {
  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    if (this.options.required) {
      this.validators.push(Validators.required);
    }
    super.ngOnInit();
  }
}
