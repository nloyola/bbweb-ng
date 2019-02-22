import { DomainEntity } from './domain-entity.model';
import { EntityInfo } from './entity-info.model';

export class EntitySet extends DomainEntity {

  allEntities: boolean;

  entityData: EntityInfo[];

  isContentTypeAll(): boolean {
    return this.allEntities;
  }

  isContentTypeNone(): boolean {
    return (!this.allEntities && (this.entityData.length <= 0));
  }

  isContentTypeSome(): boolean {
    return (!this.allEntities && (this.entityData.length > 0));
  }

  deserialize(input: any) {
    super.deserialize(input);
    if (input.entityData) {
      this.entityData = input.entityData.map((ed: any) => new EntityInfo().deserialize(ed));
    }
    return this;
  }

}
