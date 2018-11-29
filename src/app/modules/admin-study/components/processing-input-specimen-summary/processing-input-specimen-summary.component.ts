import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { InputSpecimenProcessing, ProcessingTypeInputEntity, SpecimenDefinition, CollectionEventType, ProcessingType } from '@app/domain/studies';

@Component({
  selector: 'app-processing-input-specimen-summary',
  templateUrl: './processing-input-specimen-summary.component.html',
  styleUrls: ['./processing-input-specimen-summary.component.scss']
})
export class ProcessingInputSpecimenSummaryComponent implements OnInit, OnChanges {
  @Input() input: InputSpecimenProcessing;
  @Input() inputEntity: ProcessingTypeInputEntity;

  specimenDefinition: SpecimenDefinition;

  constructor() {}

  ngOnInit() {
    this.assignSpecimenDefinition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputEntity) {
      this.inputEntity = changes.inputEntity.currentValue;
      this.assignSpecimenDefinition();
    }
  }

  private assignSpecimenDefinition() {
    if (!this.inputEntity) { return; }

    if (this.input.definitionType === 'collected') {
      this.specimenDefinition = (this.inputEntity as CollectionEventType).specimenDefinitions
        .find(sd => sd.id === this.input.specimenDefinitionId);
    } else {
      this.specimenDefinition = (this.inputEntity as ProcessingType).output.specimenDefinition;
    }
  }

}
