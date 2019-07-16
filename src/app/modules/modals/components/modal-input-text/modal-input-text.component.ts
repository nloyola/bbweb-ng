import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ModalInputBaseComponent } from '../modal-input-base.component';

@Component({
  selector: 'app-modal-input-text',
  templateUrl: './modal-input-text.component.html',
  styleUrls: ['./modal-input-text.component.scss']
})
export class ModalInputTextComponent extends ModalInputBaseComponent<string> {

  @Input() options: ModalInputTextOptions;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    if (this.options.required) {
      this.validators.push(Validators.required);
    }

    if (this.options.minLength) {
      this.validators.push(Validators.minLength(this.options.minLength));
    }

    super.ngOnInit();
  }

}
