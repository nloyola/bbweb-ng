import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { ModalInputTextComponent } from '../modal-input-text/modal-input-text.component';
import { takeUntil } from 'rxjs/operators';
import { ModalInputBaseComponent } from '../modal-input-base.component';

@Component({
  selector: 'app-modal-input-boolean',
  templateUrl: './modal-input-boolean.component.html',
  styleUrls: ['./modal-input-boolean.component.scss']
})
export class ModalInputBooleanComponent extends ModalInputBaseComponent<boolean>
  implements OnInit, OnDestroy {

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
