import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export interface NumberValidatorOptions {
  greaterThan?: number;
  lessThan?: number;
}

export class CustomValidators {

  static floatNumber(options: NumberValidatorOptions): ValidatorFn {
    return (control: AbstractControl) => {
      if (Validators.required(control) != null) {
        return null;
      }

      const val: number = control.value;
      const invalid = { 'number': true };

      // also accounts for exponential numbers
      if (isNaN(val)
          || !(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][-+]?[0-9]+)?/.test(val.toString()))) {
        return invalid;
      } else if (!isNaN(options.greaterThan)) {
        return (val <= options.greaterThan) ? invalid : null;
      } else if (!isNaN(options.lessThan)) {
        return (val >= options.lessThan) ? {'number': true} : null;
      }

      return null;
    };
  }

}
