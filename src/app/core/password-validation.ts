import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
export class PasswordValidation {
  static matchingPasswords(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      const password = control.get('password').value;
      const confirmPassword = control.get('confirmPassword').value;

      return password.length && confirmPassword.length && password === confirmPassword
        ? null
        : { passwordsNonMatching: 'passwords do not match' };
    };
  }
}
