import { EntityInfo, IEntityInfo, JSONArray, JSONObject } from '@app/domain';
import { CollectionEventType, ICollectionEventType } from './collection-event-type.model';
import { ISpecimenDefinitionName, SpecimenDefinitionName } from './specimen-definition-name.model';

export interface ICollectedSpecimenDefinitionName extends IEntityInfo<ICollectionEventType> {

  specimenDefinitionNames: ISpecimenDefinitionName[];

}

export class CollectedSpecimenDefinitionName extends EntityInfo<CollectionEventType>
  implements ICollectedSpecimenDefinitionName {

  specimenDefinitionNames: SpecimenDefinitionName[];

  deserialize(obj: JSONObject) {
    super.deserialize(obj);

    if (obj.specimenDefinitionNames !== undefined) {
      this.specimenDefinitionNames = (obj.specimenDefinitionNames as JSONArray)
        .map((sdn: JSONObject) => new SpecimenDefinitionName().deserialize(sdn));
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
