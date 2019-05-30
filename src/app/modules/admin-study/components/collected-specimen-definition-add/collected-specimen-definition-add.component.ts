import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectedSpecimenDefinition } from '@app/domain/studies';
import { CustomValidators } from '@app/shared/validators';
import { Observable } from 'rxjs';
import { SpecimenDefinitionAddComponent } from '../specimen-definition-add/specimen-definition-add.component';

@Component({
  selector: 'app-collected-specimen-definition-add-ui',
  templateUrl: './collected-specimen-definition-add.component.html',
  styleUrls: ['./collected-specimen-definition-add.component.scss']
})
export class CollectedSpecimenDefinitionAddComponent implements OnInit, OnChanges {

  /* tslint:disable-next-line:no-input-rename */
  @Input('isSaving') isSaving$: Observable<boolean>;
  /* tslint:enable-next-line:no-input-rename */

  @Input() entityName: string;
  @Input() specimenDefinition: CollectedSpecimenDefinition;

  @Output() submitted = new EventEmitter<CollectedSpecimenDefinition>();
  @Output() cancelled = new EventEmitter<any>();

  title: string;
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.assignTitle();
    this.form = this.formBuilder.group({
      subform: SpecimenDefinitionAddComponent.buildSubForm(this.specimenDefinition),
      amount: [ this.specimenDefinition.amount,
                [ Validators.required, CustomValidators.floatNumber({ greaterThan: 0 }) ]],
      maxCount: [ this.specimenDefinition.maxCount,
                  [ Validators.required, Validators.min(1), Validators.pattern(/^[0-9]*$/) ]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.specimenDefinition &&
        (changes.specimenDefinition.currentValue.id !== null)) {
      this.specimenDefinition = changes.specimenDefinition.currentValue;
      this.assignTitle();
    }
  }

  get subform() {
    return this.form.get('subform');
  }

  get name() {
    return this.form.get('subform').get('name');
  }

  get description() {
    return this.form.get('subform').get('sub-form').get('description');
  }

  get anatomicalSource() {
    return this.form.get('anatomicalSource');
  }

  get preservation() {
    return this.form.get('preservation');
  }

  get temperature() {
    return this.form.get('temperature');
  }

  get specimenType() {
    return this.form.get('specimenType');
  }

  get units() {
    return this.form.get('units');
  }

  get amount() {
    return this.form.get('amount');
  }

  get maxCount() {
    return this.form.get('maxCount');
  }

  onSubmit(): void {
    this.submitted.emit(this.formToSpecimenDefinition());
  }

  onCancel(): void {
    this.cancelled.emit(null);
  }

  private assignTitle() {
    this.title = this.specimenDefinition.isNew()
      ? 'Add Collected Specimen' : 'Update Collected Specimen';
  }

  private formToSpecimenDefinition(): CollectedSpecimenDefinition {
    const description = (this.form.value.description && (this.form.value.description.trim().length > 0))
      ? this.form.value.description : undefined;
    const specimenDefinition = new CollectedSpecimenDefinition().deserialize({
      id:                      this.specimenDefinition ? this.specimenDefinition.id : undefined,
      name:                    this.subform.value.name,
      description,
      units:                   this.subform.value.units,
      anatomicalSourceType:    this.subform.value.anatomicalSource,
      preservationType:        this.subform.value.preservation,
      preservationTemperature: this.subform.value.temperature,
      specimenType:            this.subform.value.specimenType,
      amount:                  this.form.value.amount,
      maxCount:                this.form.value.maxCount
    } as any);
    return specimenDefinition;
  }

}
