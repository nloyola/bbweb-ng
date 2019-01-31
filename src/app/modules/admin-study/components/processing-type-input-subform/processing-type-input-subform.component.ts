import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectedSpecimenDefinitionName, ProcessedSpecimenDefinitionName, ProcessingType, SpecimenDefinitionName } from '@app/domain/studies';
import { CustomValidators } from '@app/shared/validators';

@Component({
  selector: 'app-processing-type-input-subform',
  templateUrl: './processing-type-input-subform.component.html',
  styleUrls: ['./processing-type-input-subform.component.scss']
})
export class ProcessingTypeInputSubformComponent implements OnInit, OnChanges {

  @Input() processingType: ProcessingType;
  @Input() processedDefinitionNames: ProcessedSpecimenDefinitionName[];
  @Input() collectedDefinitionNames: CollectedSpecimenDefinitionName[];
  @Input() subform: FormGroup;

  specimenDefinitions: SpecimenDefinitionName[] = [];
  combinedDefinitionNames: any;

  static buildSubForm(processingType: ProcessingType) {
    const entityId = !!processingType.input.entityId ? processingType.input.entityId : '';
    const definitionId = !!processingType.input.specimenDefinitionId
      ? processingType.input.specimenDefinitionId : '';

    const subform = new FormGroup({
      definitionType: new FormControl(processingType.input.definitionType),
      entityId: new FormControl(entityId, [Validators.required]),
      definitionId: new FormControl(definitionId, [Validators.required]),
      inputProcessingType: new FormControl(entityId, [Validators.required]),
      expectedChange: new FormControl(processingType.input.expectedChange, [
        Validators.required,
        CustomValidators.floatNumber({ greaterThan: 0 })
      ]),
      count: new FormControl(processingType.input.count, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^[0-9]*$/)
      ])
    });

    return subform;
  }

  constructor() { }

  ngOnInit(): void {
    const entityId = !!this.processingType.input.entityId ? this.processingType.input.entityId : '';

    if (this.processingType.input.definitionType === 'collected') {
      this.specimenDefinitions = this.getCollectedDefinitionNames();

      this.subform.get('entityId').enable();
      this.subform.get('inputProcessingType').disable();
    } else {
      this.subform.get('inputProcessingType').enable();
      this.subform.get('entityId').disable();
      this.subform.get('definitionId').disable();
    }

    if (!entityId) {
      this.subform.get('definitionId').disable();
      this.subform.get('expectedChange').disable();
      this.subform.get('count').disable();
    }

    this.combinedDefinitionNames = this.getProcessedCombinedNames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.processedDefinitionNames) {
      this.processedDefinitionNames = changes.processedDefinitionNames.currentValue;
      this.combinedDefinitionNames = this.getProcessedCombinedNames();
    }

    if (changes.collectedDefinitionNames) {
      this.collectedDefinitionNames = changes.collectedDefinitionNames.currentValue;
      this.specimenDefinitions = this.getCollectedDefinitionNames();
    }
  }

  get haveProcessingTypes() {
    return this.processedDefinitionNames.length > 0;
  }

  get definitionType(): AbstractControl {
    return this.subform.get('definitionType');
  }

  get entityId(): AbstractControl {
    return this.subform.get('entityId');
  }

  get definitionId(): AbstractControl {
    return this.subform.get('definitionId');
  }

  get inputProcessingType(): AbstractControl {
    return this.subform.get('inputProcessingType');
  }

  get expectedChange(): AbstractControl {
    return this.subform.get('expectedChange');
  }

  get count(): AbstractControl {
    return this.subform.get('count');
  }

  definitionTypeIsCollected(): boolean {
    return this.definitionType.value === 'collected';
  }

  definitionTypeUpdated() {
    this.expectedChange.disable();
    this.count.disable();

    if (this.definitionType.value === 'collected') {
      this.entityId.enable();
      this.entityId.setValue('');
    } else {
      this.entityId.disable();
      this.definitionId.disable();
      this.inputProcessingType.setValue('');
      this.processedDefinitionSelected();
    }
  }

  eventTypeSelected() {
    this.definitionId.setValue('');

    if (this.entityId.value === '') {
      this.definitionId.disable();
      this.expectedChange.disable();
      this.count.disable();
    } else {
      this.specimenDefinitions = this.getCollectedDefinitionNames();
      this.definitionId.enable();
    }
  }

  specimenDefinitionSelected() {
    if (this.definitionId.value === '') {
      this.expectedChange.disable();
      this.count.disable();
    } else {
      this.expectedChange.enable();
      this.count.enable();
    }
  }

  processedDefinitionSelected() {
    this.inputProcessingType.enable();
    if (this.inputProcessingType.value === '') {
      this.expectedChange.disable();
      this.count.disable();
    } else {
      this.expectedChange.enable();
      this.count.enable();
    }
  }

  private getCollectedDefinitionNames() {
    if ((this.entityId.value === '') ||
        (this.definitionType.value !== 'collected')
        || (this.collectedDefinitionNames.length <= 0)) { return; }

    const eventTypeName = this.collectedDefinitionNames.find(et => et.id === this.entityId.value);
    if (eventTypeName) {
      return eventTypeName.sortedSpecimenDefinitionNames();
    }
    throw new Error('could not find event type name');
  }

  private getProcessedCombinedNames() {
    // cannot have this processing type be an input to itself, therefore filter it out
    return this.processedDefinitionNames
      .filter(definitionName => definitionName.id !== this.processingType.id)
      .map(definitionName => {
        const combinedName = `${definitionName.specimenDefinitionName.name} (${definitionName.name})`;
        return {
          ...definitionName,
          combinedName
        };
      });
  }

}
