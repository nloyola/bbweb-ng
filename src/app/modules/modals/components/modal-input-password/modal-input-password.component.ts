import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PasswordValidation } from '@app/core/password-validation';
import { ModalInputTextComponent } from '@app/modules/modals/components/modal-input-text/modal-input-text.component';

@Component({
  selector: 'app-modal-input-password',
  templateUrl: './modal-input-password.component.html',
  styleUrls: ['./modal-input-password.component.scss']
})
export class ModalInputPasswordComponent extends ModalInputTextComponent {

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    this.options = { required: true, minLength: 8 };
    super.ngOnInit();
    this.modalInputForm.addControl('password',
                                   new FormControl('', [ Validators.required, Validators.minLength(8) ]));
    this.modalInputForm.addControl('confirmPassword',
                                   new FormControl('', [ Validators.required, Validators.minLength(8) ]));
    this.modalInputForm.setValidators(PasswordValidation.matchingPasswords());
  }

  get password(): AbstractControl {
    return this.modalInputForm.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.modalInputForm.get('confirmPassword');
  }

  close(): (result: any) => void {
    return (source: any): void => {
      const result = {
        confirmed: (source === 'OK'),
        value: {
          currentPassword: this.modalInputForm.value.text,
          newPassword: this.modalInputForm.value.password
        },
      };
      this.modalClose(result);
    };
  }

}
