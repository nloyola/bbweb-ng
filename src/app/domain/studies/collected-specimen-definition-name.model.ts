import { NamedEntityInfo, INamedEntityInfo } from '@app/domain';
import { CollectionEventType, ICollectionEventType } from './collection-event-type.model';
import { ISpecimenDefinitionName, SpecimenDefinitionName } from './specimen-definition-name.model';

export interface ICollectedSpecimenDefinitionName extends INamedEntityInfo<ICollectionEventType> {
  specimenDefinitionNames: ISpecimenDefinitionName[];
}

export class CollectedSpecimenDefinitionName extends NamedEntityInfo<CollectionEventType>
  implements ICollectedSpecimenDefinitionName {
  specimenDefinitionNames: SpecimenDefinitionName[];

  deserialize(obj: ICollectedSpecimenDefinitionName): this {
    super.deserialize(obj);

    if (obj.specimenDefinitionNames !== undefined) {
      this.specimenDefinitionNames = obj.specimenDefinitionNames.map(sdn =>
        new SpecimenDefinitionName().deserialize(sdn)
      );
    }

    return this;
  }

  sortedSpecimenDefinitionNames(): SpecimenDefinitionName[] {
    return this.specimenDefinitionNames.sort((sd1, sd2) => {
      if (sd1.name < sd2.name) {
        return -1;
      }
      if (sd1.name > sd2.name) {
        return 1;
      }
      return 0;
    });
  }
}
