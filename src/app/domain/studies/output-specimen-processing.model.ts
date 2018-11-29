import { ProcessedSpecimenDefinition } from './processed-specimen-definition.model';
import { SpecimenProcessing } from './specimen-processing.model';

export class OutputSpecimenProcessing extends SpecimenProcessing {

  specimenDefinition: ProcessedSpecimenDefinition;

  constructor() {
    super();
    this.specimenDefinition = new ProcessedSpecimenDefinition();
  }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

}
