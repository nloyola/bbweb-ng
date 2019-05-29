import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Annotation, annotationFromValueType, ValueTypes } from '@app/domain/annotations';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-annotations-add-subform',
  templateUrl: './annotations-add-subform.component.html',
  styleUrls: ['./annotations-add-subform.component.scss']
})
export class AnnotationsAddSubformComponent {

  // see: https://stackoverflow.com/questions/43384804/how-to-validate-that-at-least-one-checkbox-should-be-selected/43386577

  @Input() annotationsGroup: FormGroup;
  faCalendar = faCalendar;

  static buildSubForm(annotations: Annotation[], unsubscribe$: Subject<void>): FormArray {
    const formArray = new FormArray([]);
    annotations.forEach(annotation => {
      let control: AbstractControl;
      const validators: ValidatorFn[] = [];

      if (annotation.annotationType.required) {
        validators.push(Validators.required);
      }

      if (annotation.annotationType.maxValueCount > 1) {
        const checkboxGroup = annotation.annotationType.options.map(option => {
          return new FormGroup({
            id: new FormControl(option),
            text: new FormControl(option),
            checkbox: new FormControl(false)
          });
        });
        const checkboxArray = new FormArray(checkboxGroup);
        const hiddenControl = new FormControl(this.mapSelectedOptions(checkboxArray.value), validators);
        const optionsGroup = new FormGroup({
          options: checkboxArray,
          selectedOptions: hiddenControl
        })

        checkboxArray.valueChanges.pipe(
          takeUntil(unsubscribe$)
        ).subscribe(v => {
          hiddenControl.setValue(this.mapSelectedOptions(v));
          hiddenControl.markAsTouched();
        });

        control = optionsGroup;
      } else {
        control = new FormControl(annotation.value, validators);
      }

      formArray.push(new FormGroup({
        id: new FormControl(annotation.annotationType.id),
        text: new FormControl(annotation.annotationType.name),
        valueType: new FormControl(annotation.annotationType.valueType),
        maxValueCount: new FormControl(annotation.annotationType.maxValueCount),
        options: new FormControl(annotation.annotationType.options),
        field: control
      }));
    });
    return formArray;
  }

  static controlName(annotation: Annotation): string {
    return annotation.annotationType.name.toLowerCase().replace(/\s/g, '');
  }

  static mapSelectedOptions(options: any[]) {
    let selectedOptions = options.filter(option => option.checkbox).map(option => option.id);
    return selectedOptions.length ? selectedOptions : null;
  }

  static valueToAnnotations(annotationsGroup: FormGroup): Annotation[] {
    return annotationsGroup.value.annotations.map(value => {
      const annotation = annotationFromValueType(value.valueType);
      annotation.annotationTypeId = value.id;

      if (value.valueType === ValueTypes.Select) {
        if (value.maxValueCount === 1) {
          annotation.value = [ value.field ];
        } else if (value.maxValueCount > 1) {
          annotation.value = value.field.options.filter(o => o.checkbox).map(o => o.id);
        } else {
          throw new Error('max value count is invalid');
        }
      } else {
        annotation.value = value.field;
      }
      return annotation;
    });
  }

  constructor() {}

  get annotations(): FormArray {
    return this.annotationsGroup.get('annotations') as FormArray;
  }

  annotationTrackBy(_index: number, annotation: Annotation): string {
    return AnnotationsAddSubformComponent.controlName(annotation);
  }
}
