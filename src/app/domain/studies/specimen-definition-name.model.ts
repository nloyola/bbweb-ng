import { EntityInfo } from '../entity-info.model';

export class SpecimenDefinitionName extends EntityInfo {

  deserialize(obj: any) {
    super.deserialize(obj);
    return this;
  }

}
