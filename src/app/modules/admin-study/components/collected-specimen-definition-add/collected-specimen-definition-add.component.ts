import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnatomicalSource, PreservationTemperature, PreservationType, SpecimenType } from '@app/domain';
import { CollectedSpecimenDefinition } from '@app/domain/studies';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-collected-specimen-definition-add-ui',
  templateUrl: './collected-specimen-definition-add.component.html',
  styleUrls: ['./collected-specimen-definition-add.component.scss']
})
export class CollectedSpecimenDefinitionAddComponent implements OnInit, OnChanges {

  @Input('isSaving') isSaving$: Observable<boolean>;
  @Input() specimenDefinition: CollectedSpecimenDefinition;

  @Output() submitted = new EventEmitter<CollectedSpecimenDefinition>();
  @Output() cancelled = new EventEmitter<any>();

  @ViewChild("nameInput") nameInput: ElementRef;

  title: string;
  form: FormGroup;

  anatomicalSources: string[];
  anatomicalSourceLabels: { [ key: string]: string };

  preservationTypes: string[];
  preservationTypeLabels: { [ key: string]: string };

  preservationTemperatures: string[];
  preservationTemperatureLabels: { [ key: string]: string };

  specimenTypes: string[];
  specimenTypeLabels: { [ key: string]: string };

  constructor(private formBuilder: FormBuilder) {
    this.createEnumLabels();
  }

  ngOnInit() {
    this.nameInput.nativeElement.focus();
    this.title = 'Add Collected Specimen';

    this.form = this.formBuilder.group(
      {
        name: [ this.specimenDefinition.name, [ Validators.required ]],
        description: [ this.specimenDefinition.description ],
        anatomicalSource: [ this.specimenDefinition.anatomicalSourceType, [ Validators.required ]],
        preservation: [ this.specimenDefinition.preservationType, [ Validators.required ]],
        temperature: [ this.specimenDefinition.preservationTemperature, [ Validators.required ]],
        specimenType: [ this.specimenDefinition.specimenType, [ Validators.required ]],
        units: [ this.specimenDefinition.units, [ Validators.required ]],
        amount: [ this.specimenDefinition.amount,
                  [ Validators.required, Validators.pattern(/^[0-9]*\.?[0-9]+$/) ]],
        maxCount: [ this.specimenDefinition.maxCount,
                    [ Validators.required, Validators.min(1), Validators.pattern(/^[0-9]*$/) ]]
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.specimenDefinition &&
        (changes.specimenDefinition.currentValue.id !== null)) {
      this.specimenDefinition = changes.specimenDefinition.currentValue;
      this.title = this.specimenDefinition.isNew() ? 'Add Collected Specimen' : 'Update Collected Specimen';
      this.specimenDefinitionToForm();
    }
  }

  get name() {
    return this.form.get('name');
  }

  get description() {
    return this.form.get('description');
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

  private specimenDefinitionToForm(): void {
    if (this.form === undefined) { return ; }

    this.name.setValue(this.specimenDefinition.name);
    this.description.setValue(this.specimenDefinition.description);
    this.units.setValue(this.specimenDefinition.units);
    this.anatomicalSource.setValue(this.specimenDefinition.anatomicalSourceType);
    this.preservation.setValue(this.specimenDefinition.preservationType);
    this.temperature.setValue(this.specimenDefinition.preservationTemperature);
    this.specimenType.setValue(this.specimenDefinition.specimenType);
    this.amount.setValue(this.specimenDefinition.amount);
    this.maxCount.setValue(this.specimenDefinition.maxCount);
  }

  private formToSpecimenDefinition(): CollectedSpecimenDefinition {
    const description = (this.form.value.description && (this.form.value.description.trim().length > 0))
      ? this.form.value.description : undefined;
    const specimenDefinition = new CollectedSpecimenDefinition().deserialize({
      id:                      this.specimenDefinition ? this.specimenDefinition.id : undefined,
      name:                    this.form.value.name,
      description,
      units:                   this.form.value.units,
      anatomicalSourceType:    this.form.value.anatomicalSource,
      preservationType:        this.form.value.preservation,
      preservationTemperature: this.form.value.temperature,
      specimenType:            this.form.value.specimenType,
      amount:                  this.form.value.amount,
      maxCount:                this.form.value.maxCount
    });
    return specimenDefinition;
  }

  private createEnumLabels() {
    this.anatomicalSources = Object.values(AnatomicalSource);
    this.anatomicalSourceLabels = {};
    Object.values(AnatomicalSource).forEach(a => this.anatomicalSourceLabels[a] = a.toUpperCase());

    this.preservationTypes = Object.values(PreservationType);
    this.preservationTypeLabels = {};
    Object.values(PreservationType).forEach(a => this.preservationTypeLabels[a] = a.toUpperCase());

    this.preservationTemperatures = Object.values(PreservationTemperature);
    this.preservationTemperatureLabels = {};
    Object.values(PreservationTemperature)
      .forEach(a => this.preservationTemperatureLabels[a] = a.toUpperCase());

    this.specimenTypes = Object.values(SpecimenType);
    this.specimenTypeLabels = {};
    Object.values(SpecimenType).forEach(a => this.specimenTypeLabels[a] = a.toUpperCase());
  }

}
