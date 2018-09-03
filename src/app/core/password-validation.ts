import { AbstractControl } from '@angular/forms';
export class PasswordValidation {

  static matchingPasswords(control: AbstractControl) {
    const password = control.get('password').value; // to get value in input tag
    const confirmPassword = control.get('confirmPassword').value; // to get value in input tag
    if (password.length &&
      confirmPassword.length &&
      (password === confirmPassword)) {
      control.get('confirmPassword').setErrors(null);
    } else {
      control.get('confirmPassword').setErrors({ passwordsNonMatching: true });
    }
  }
}
