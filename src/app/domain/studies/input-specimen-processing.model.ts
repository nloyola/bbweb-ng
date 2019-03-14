import { ISpecimenProcessing } from './specimen-processing.model';
import { JSONObject } from '@app/domain';

export interface IInputSpecimenProcessing extends ISpecimenProcessing {

  definitionType: 'collected' | 'processed';

  entityId: string;

  specimenDefinitionId: string;

  expectedChange: number;

  count: number;
}

export class InputSpecimenProcessing implements IInputSpecimenProcessing {

  definitionType: 'collected' | 'processed';
  entityId: string;
  specimenDefinitionId: string;
  expectedChange: number;
  count: number;
  containerTypeId: string | null;

  constructor() {
    this.definitionType = 'collected';
  }

  deserialize(input: JSONObject) {
    Object.assign(this, input);
    return this;
  }

}
