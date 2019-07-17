import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AnatomicalSource, PreservationTemperature, PreservationType, SpecimenType } from '@app/domain';
import { CollectedSpecimenDefinition, SpecimenDefinition } from '@app/domain/studies';

/**
 * Meant to be a 'sub form' that allows a user to input the common fields used in a {@link
 * SpecimenDefinition}.
 */
@Component({
  selector: 'app-specimen-definition-add',
  templateUrl: './specimen-definition-add.component.html',
  styleUrls: ['./specimen-definition-add.component.scss']
})
export class SpecimenDefinitionAddComponent implements OnInit {

  @Input() specimenDefinition: CollectedSpecimenDefinition;
  @Input() subform: FormGroup;

  @ViewChild('nameInput', { static: true}) nameInput: ElementRef;

  anatomicalSources: string[];
  anatomicalSourceLabels: { [ key: string]: string };

  preservationTypes: string[];
  preservationTypeLabels: { [ key: string]: string };

  preservationTemperatures: string[];
  preservationTemperatureLabels: { [ key: string]: string };

  specimenTypes: string[];
  specimenTypeLabels: { [ key: string]: string };

  static buildSubForm(specimenDefinition: SpecimenDefinition): FormGroup {
    const name = specimenDefinition.name ? specimenDefinition.name : '';
    const anatomicalSource = specimenDefinition.anatomicalSourceType
      ? specimenDefinition.anatomicalSourceType : '';
    const preservationType = specimenDefinition.preservationType
      ? specimenDefinition.preservationType : '';
    const preservationTemperature = specimenDefinition.preservationTemperature
      ? specimenDefinition.preservationTemperature : '';
    const specimenType = specimenDefinition.specimenType ? specimenDefinition.specimenType : '';

    return new FormGroup({
      name: new FormControl(name, Validators.required),
      description: new FormControl(specimenDefinition.description),
      anatomicalSource: new FormControl(anatomicalSource, Validators.required),
      preservation: new FormControl(preservationType, Validators.required),
      temperature: new FormControl(preservationTemperature, Validators.required),
      specimenType: new FormControl(specimenType, Validators.required),
      units: new FormControl(specimenDefinition.units, Validators.required)
    });
  }

  constructor() {
    this.createEnumLabels();
  }

  ngOnInit(): void {
    this.nameInput.nativeElement.focus();
  }

  get name() {
    return this.subform.get('name');
  }

  get description() {
    return this.subform.get('description');
  }

  get anatomicalSource() {
    return this.subform.get('anatomicalSource');
  }

  get preservation() {
    return this.subform.get('preservation');
  }

  get temperature() {
    return this.subform.get('temperature');
  }

  get specimenType() {
    return this.subform.get('specimenType');
  }

  get units() {
    return this.subform.get('units');
  }

  get amount() {
    return this.subform.get('amount');
  }

  get maxCount() {
    return this.subform.get('maxCount');
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
