import { EntityInfo } from '../entity-info.model';
import { SpecimenDefinitionName } from './specimen-definition-name.model';

export class CollectedSpecimenDefinitionName extends EntityInfo {

  specimenDefinitionNames: SpecimenDefinitionName[];

  deserialize(obj: any) {
    super.deserialize(obj);

    if (obj.specimenDefinitionNames !== undefined) {
      this.specimenDefinitionNames =
        obj.specimenDefinitionNames.map((sdn: any) => new SpecimenDefinitionName().deserialize(sdn));
    }

    return this;
  }

  sortedSpecimenDefinitionNames(): SpecimenDefinitionName[] {
    return this.specimenDefinitionNames.sort((sd1, sd2) => {
      if (sd1.name < sd2.name) { return -1; }
      if (sd1.name > sd2.name) { return 1; }
      return 0;
    });
  }
}
