import { JSONObject } from '@app/domain';
import {
  IProcessedSpecimenDefinition,
  ProcessedSpecimenDefinition
} from './processed-specimen-definition.model';
import { ISpecimenProcessing } from './specimen-processing.model';

export interface IOutputSpecimenProcessing extends ISpecimenProcessing {
  specimenDefinition: IProcessedSpecimenDefinition;

  expectedChange: number;

  count: number;

  containerTypeId: string | null;
}

export class OutputSpecimenProcessing implements IOutputSpecimenProcessing {
  specimenDefinition: ProcessedSpecimenDefinition;
  expectedChange: number;
  count: number;
  containerTypeId: string | null;

  constructor() {
    this.specimenDefinition = new ProcessedSpecimenDefinition();
  }

  deserialize(input: JSONObject): this {
    const { specimenDefinition, expectedChange, count, containerTypeId } = input;
    Object.assign(this, { specimenDefinition, expectedChange, count, containerTypeId });
    return this;
  }
}
