import { SpecimenProcessing } from './specimen-processing.model';

export class InputSpecimenProcessing extends SpecimenProcessing {

  definitionType: 'collected' | 'processed';

  entityId: string;

  specimenDefinitionId: string;

  expectedChange: number;

  count: number;

  constructor() {
    super();
    this.definitionType = 'collected';
  }

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

}
