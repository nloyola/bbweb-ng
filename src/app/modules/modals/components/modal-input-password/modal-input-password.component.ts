import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PasswordValidation } from '@app/core/password-validation';
import { ModalInputTextComponent } from '@app/modules/modals/components/modal-input-text/modal-input-text.component';
import { User } from '@app/domain/users';

@Component({
  selector: 'app-modal-input-password',
  templateUrl: './modal-input-password.component.html',
  styleUrls: ['./modal-input-password.component.scss']
})
export class ModalInputPasswordComponent extends ModalInputTextComponent implements OnInit, OnDestroy {

  @Input() user: User;

  constructor(formBuilder: FormBuilder) {
    super(formBuilder);
  }

  ngOnInit() {
    this.options = {
      ...this.options,
      required: true,
      minLength: 8
    };
    super.ngOnInit();
    this.form.addControl(
      'password',
      new FormControl('', [ Validators.required, Validators.minLength(8) ]));
    this.form.addControl(
      'confirmPassword',
      new FormControl('', [ Validators.required, Validators.minLength(8) ]));
    this.form.setValidators(PasswordValidation.matchingPasswords());
  }

  get password(): AbstractControl {
    return this.form.get('password');
  }

  get confirmPassword(): AbstractControl {
    return this.form.get('confirmPassword');
  }

  confirm(): void {
    this.modal.close({
      currentPassword: this.form.value.input,
      newPassword: this.form.value.password
    });
  }

}
