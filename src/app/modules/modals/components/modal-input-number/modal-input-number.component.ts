import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalInputBaseComponent } from '../modal-input-base.component';

@Component({
  selector: 'app-modal-input-number',
  templateUrl: './modal-input-number.component.html',
  styleUrls: ['./modal-input-number.component.scss']
})
export class ModalInputNumberComponent extends ModalInputBaseComponent<number> implements OnInit, OnDestroy {
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
