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

      // also accounts for exponential numbers
      if (isNaN(val)
          || !(/[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][-+]?[0-9]+)?/.test(val.toString()))) {
        return { 'number': 'value is not a floating point number' };
      } else if (!isNaN(options.greaterThan)) {
        return (val <= options.greaterThan)
          ? { 'number': `value is not greater than ${options.greaterThan}` } : null;
      } else if (!isNaN(options.lessThan)) {
        return (val >= options.lessThan)
          ? { 'number': `value is not less than ${options.lessThan}` } : null;
      }

      return null;
    };
  }

}
