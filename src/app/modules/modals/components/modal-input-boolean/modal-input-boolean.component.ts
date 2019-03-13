import { Component, OnInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { ModalInputTextComponent } from '../modal-input-text/modal-input-text.component';

@Component({
  selector: 'app-modal-input-boolean',
  templateUrl: './modal-input-boolean.component.html',
  styleUrls: ['./modal-input-boolean.component.scss']
})
export class ModalInputBooleanComponent extends ModalInputTextComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    const validators = [];
    if (this.options.required) {
      validators.push(Validators.required);
    }

    this.modalInputForm = this.formBuilder.group({ input: [this.value, validators] });

    this.modalInputForm.valueChanges.subscribe(() => {
      this.modalInputValid = true;
    });
  }

  get input(): AbstractControl {
    return this.modalInputForm.get('input');
  }

  confirm(): void {
    this.modal.close(this.modalInputForm.value.input);
  }

}
