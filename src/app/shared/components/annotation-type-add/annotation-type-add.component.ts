import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnnotationType, MaxValueCount, ValueTypes } from '@app/domain/annotations';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-annotation-type-add',
  templateUrl: './annotation-type-add.component.html'
})
export class AnnotationTypeAddComponent implements OnInit, OnChanges {

  /* tslint:disable-next-line:no-input-rename */
  @Input('isSaving') isSaving$: Observable<boolean>;

  @Input() entityName: string;
  @Input() annotationType: AnnotationType;

  @Output() submitted = new EventEmitter<AnnotationType>();
  @Output() cancelled = new EventEmitter<any>();

  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;

  form: FormGroup;
  valueTypes: string[];
  valueTypeLabels: { [ key: string]: string };
  title: string;

  protected parentStateRelativePath: string;

  constructor(private formBuilder: FormBuilder) {
    this.valueTypes = Object.values(ValueTypes);
    this.valueTypeLabels = {};
    Object.values(ValueTypes).forEach(vt => this.valueTypeLabels[vt] = vt.toUpperCase());
  }

  ngOnInit() {
    this.nameInput.nativeElement.focus();
    if (!this.annotationType) {
      throw new Error('annotation type is not defined');
    }

    this.title = this.annotationType.isNew() ? 'Add Annotation' : 'Update Annotation';
    const valueType = this.annotationType.valueType ? this.annotationType.valueType : '';
    const maxValueCount = this.annotationType.maxValueCount
      ? this.annotationType.maxValueCount : MaxValueCount.None;

    this.form = this.formBuilder.group(
      {
        name: [ this.annotationType.name, [ Validators.required ]],
        description: [ this.annotationType.description ],
        required: [ this.annotationType.required ],
        valueType: [ valueType, [ Validators.required ]],
        maxValueCount: [ maxValueCount, [ Validators.required ]],
        optionsGroup: this.formBuilder.array([])
      });

    if (this.isValueTypeSelect()) {
      this.annotationType.options.forEach((option: String) => {
        this.options.push(this.formBuilder.control(option, Validators.required));
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.annotationType && !changes.annotationType.firstChange) {
      this.annotationType = changes.annotationType.currentValue;
      this.title = 'Update Annotation';
      this.annotationTypeToForm();
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

  valueTypeSelected() {
    this.maxValueCount.setValue(MaxValueCount.None);
    while (this.options.length > 0) {
      this.options.removeAt(0);
    }

    if (this.isValueTypeSelect()) {
      this.maxValueCount.setValue(MaxValueCount.SelectSingle);
      this.optionAdd();
    }
  }

  optionAdd() {
    this.options.push(this.formBuilder.control('', Validators.required));
  }

  optionRemove(index: number) {
    this.checkInvalidIndex(index);
    this.options.removeAt(index);
  }

  getOption(index: number) {
    this.checkInvalidIndex(index);
    return this.options.at(index);
  }

  removeButtonDisabled(): boolean {
    return this.options.controls.length <= 1;
  }

  onSubmit(): void {
    this.submitted.emit(this.formToAnnotationType());
  }

  onCancel(): void {
    this.cancelled.emit(null);
  }

  private annotationTypeToForm() {
    this.name.setValue(this.annotationType.name);
    this.description.setValue(this.annotationType.description);
    this.required.setValue(this.annotationType.required);
    this.valueType.setValue(this.annotationType.valueType);
    this.maxValueCount.setValue(
      this.annotationType.maxValueCount ? this.annotationType.maxValueCount : MaxValueCount.None);

    if (this.isValueTypeSelect()) {
      this.annotationType.options.forEach((option: String) => {
        this.options.push(this.formBuilder.control(option, Validators.required));
      });
    }
  }

  private formToAnnotationType(): AnnotationType {
    const annotationType = new AnnotationType().deserialize({
      id: this.annotationType ? this.annotationType.id : undefined,
      name: this.form.value.name,
      description: this.form.value.description,
      valueType: this.form.value.valueType,
      maxValueCount: this.isValueTypeSelect() ? this.form.value.maxValueCount : undefined,
      required: this.form.value.required !== null ? this.form.value.required : false,
      options: this.form.value.optionsGroup,
    });
    return annotationType;
  }

  private checkInvalidIndex(index: number): void {
    if ((index < 0) || (index >= this.options.length)) {
      throw new Error('invalid option index: ' + index);
    }
  }

}
