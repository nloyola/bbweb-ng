import { EntityInfo } from '../entity-info.model';
import { SpecimenDefinitionName } from './specimen-definition-name.model';

export class ProcessedSpecimenDefinitionName extends EntityInfo {

  specimenDefinitionName: SpecimenDefinitionName;

  deserialize(obj: any) {
    super.deserialize(obj);

    if (obj.specimenDefinitionName !== undefined) {
      this.specimenDefinitionName = new SpecimenDefinitionName().deserialize(obj.specimenDefinitionName);
    }

    return this;
  }
}
