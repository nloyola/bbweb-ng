import { CustomValidators } from './custom-validators';
import { FormControl } from '@angular/forms';

describe('CustomValidator', () => {
  beforeEach(() => {});

  describe('for floatNumber', () => {
    describe('validation passes', () => {
      it('when not using options', () => {
        const testValues = ['0', '1', '.1', '1.0', '1e-9'];
        testValues.forEach(testValue => {
          expect(CustomValidators.floatNumber({})(new FormControl(testValue))).toEqual(null);
        });
      });

      it('when using greater than option', () => {
        const testValues = ['1', '0.1', '1.0', '1e-9'];
        testValues.forEach(testValue => {
          expect(CustomValidators.floatNumber({ greaterThan: 0 })(new FormControl(testValue))).toEqual(null);
        });
      });

      it('when using less than option', () => {
        const testValues = ['0', '0.1', '0.99'];
        testValues.forEach(testValue => {
          expect(CustomValidators.floatNumber({ lessThan: 1 })(new FormControl(testValue))).toEqual(null);
        });
      });
    });

    describe('validation fails ', () => {
      it('when not using options', () => {
        const testValues = ['a', 'true', 'e10'];
        testValues.forEach(testValue => {
          const result = CustomValidators.floatNumber({})(new FormControl(testValue));
          expect(result).not.toBeNull();
          expect(result['number']).toBe('value is not a floating point number');
        });
      });

      it('when using greater than option', () => {
        const testValues = ['-1', '-1.1', '-1e-9'];
        testValues.forEach(testValue => {
          const result = CustomValidators.floatNumber({ greaterThan: 0 })(new FormControl(testValue));
          expect(result).not.toBeNull();
          expect(result['number']).toContain('value is not greater than');
        });
      });

      it('when using less than option', () => {
        const testValues = ['1.0', '1.1', '2'];
        testValues.forEach(testValue => {
          const result = CustomValidators.floatNumber({ lessThan: 1 })(new FormControl(testValue));
          expect(result).not.toBeNull();
          expect(result['number']).toContain('value is not less than');
        });
      });
    });
  });
});
