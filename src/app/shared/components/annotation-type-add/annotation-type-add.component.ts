import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotationType, MaxValueCount, ValueTypes } from '@app/domain/annotations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-annotation-type-add',
  templateUrl: './annotation-type-add.component.html',
  styleUrls: ['./annotation-type-add.component.scss']
})
export class AnnotationTypeAddComponent implements OnInit {

  @Input() annotationType: AnnotationType;

  form: FormGroup;
  valueTypes: string[];
  valueTypeLabels: { [ key: string]: string };

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute) {
    this.valueTypes = Object.values(ValueTypes);
    this.valueTypeLabels = {};
    Object.values(ValueTypes).forEach(vt => this.valueTypeLabels[vt] = vt.toUpperCase());
  }

  ngOnInit() {
    if (this.annotationType === undefined) {
      this.annotationType = new AnnotationType();
    }

    const valueType = this.annotationType.valueType ? this.annotationType.valueType : '';

    this.form = this.formBuilder.group(
      {
        name: [ this.annotationType.name, [ Validators.required ]],
        description: [ this.annotationType.description ],
        required: [ this.annotationType.required ],
        valueType: [ valueType, [ Validators.required ]],
        maxValueCount: [ this.annotationType.maxValueCount, [ Validators.required ]],
        optionsGroup: this.formBuilder.array([])
      });

    if (this.isValueTypeSelect()) {
      this.annotationType.options.forEach((option: String) => {
        this.options.push(this.formBuilder.control(option, Validators.required));
      });
    }
  }

  get name() {
    return this.form.get('name');
  }

  get description() {
    return this.form.get('description');
  }

  get required() {
    return this.form.get('required');
  }

  get valueType() {
    return this.form.get('valueType');
  }

  get maxValueCount() {
    return this.form.get('maxValueCount');
  }

  get options(): FormArray {
    return this.form.get('optionsGroup') as FormArray;
  }

  isValueTypeSelect() {
    return this.valueType.value === ValueTypes.Select;
  }

  valueTypeSelected($event) {
    this.maxValueCount.setValue(MaxValueCount.None);
    while (this.options.length > 0) {
      this.options.removeAt(0)
    }

    if (this.isValueTypeSelect()) {
      this.maxValueCount.setValue(MaxValueCount.SelectSingle);
      this.optionAdd();
    }
  }

  optionAdd() {
    this.options.push(this.formBuilder.control('', Validators.required));
  }

  optionRemove(index) {
    this.checkInvalidIndex(index);
    this.options.removeAt(index);
  }

  getOption(index) {
    this.checkInvalidIndex(index);
    return this.options.at(index);
  }

  removeButtonDisabled(): boolean {
    return this.options.controls.length <= 1;
  }

  onSubmit() {
    const annotationType = new AnnotationType().deserialize({
      id: this.annotationType ? this.annotationType.id : undefined,
      name: this.form.value.name,
      description: this.form.value.description,
      valueType: this.form.value.valueType,
      maxValueCount: this.isValueTypeSelect() ? this.form.value.maxValueCount : undefined,
      required: this.form.value.required,
      options: this.form.value.optionsGroup,
    });
    this.activeModal.close(annotationType);
  }

  onCancel() {
    this.activeModal.dismiss();
  }

  private checkInvalidIndex(index): void {
    if ((index < 0) || (index >= this.options.length)) {
      throw new Error('invalid option index: ' + index);
    }
  }

}
