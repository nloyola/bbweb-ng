import { NamedEntityInfo, INamedEntityInfo } from '@app/domain';
import { SpecimenDefinitionName, ISpecimenDefinitionName } from './specimen-definition-name.model';
import { ProcessingType, IProcessingType } from './processing-type.model';

export interface IProcessedSpecimenDefinitionName extends INamedEntityInfo<IProcessingType> {
  specimenDefinitionName: ISpecimenDefinitionName;
}

export class ProcessedSpecimenDefinitionName extends NamedEntityInfo<ProcessingType> {
  specimenDefinitionName: SpecimenDefinitionName;

  deserialize(obj: IProcessedSpecimenDefinitionName): this {
    super.deserialize(obj);

    if (obj.specimenDefinitionName !== undefined) {
      this.specimenDefinitionName = new SpecimenDefinitionName().deserialize(obj.specimenDefinitionName);
    }

    return this;
  }
}
