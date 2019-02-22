import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalInputTextComponent } from '../modal-input-text/modal-input-text.component';

@Component({
  selector: 'app-modal-input-email',
  templateUrl: './modal-input-email.component.html',
  styleUrls: ['./modal-input-email.component.scss']
})
export class ModalInputEmailComponent extends ModalInputTextComponent {

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
    this.validators = [ Validators.email ];
  }

  ngOnInit() {
    this.options = {
      ...this.options,
      minLength: undefined
    };
    super.ngOnInit();
  }

}
