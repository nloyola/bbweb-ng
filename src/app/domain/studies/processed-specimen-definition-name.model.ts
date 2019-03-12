import { EntityInfo, IEntityInfo } from '../entity-info.model';
import { SpecimenDefinitionName, ISpecimenDefinitionName } from './specimen-definition-name.model';
import { ProcessingType, IProcessingType } from './processing-type.model';

export interface IProcessedSpecimenDefinitionName extends IEntityInfo<IProcessingType> {

  specimenDefinitionName: ISpecimenDefinitionName;

}

export class ProcessedSpecimenDefinitionName extends EntityInfo<ProcessingType> {

  specimenDefinitionName: SpecimenDefinitionName;

  deserialize(obj: any) {
    super.deserialize(obj);

    if (obj.specimenDefinitionName !== undefined) {
      this.specimenDefinitionName = new SpecimenDefinitionName().deserialize(obj.specimenDefinitionName);
    }

    return this;
  }
}
