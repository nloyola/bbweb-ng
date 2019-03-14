import { ProcessedSpecimenDefinition } from './processed-specimen-definition.model';
import { ISpecimenProcessing } from './specimen-processing.model';
import { JSONObject } from '@app/domain';

export interface IOutputSpecimenProcessing extends ISpecimenProcessing {

  specimenDefinition: ProcessedSpecimenDefinition;

}

export class OutputSpecimenProcessing implements IOutputSpecimenProcessing {

  specimenDefinition: ProcessedSpecimenDefinition;
  expectedChange: number;
  count: number;
  containerTypeId: string | null;

  constructor() {
    this.specimenDefinition = new ProcessedSpecimenDefinition();
  }

  deserialize(input: JSONObject) {
    Object.assign(this, input);
    return this;
  }

}
