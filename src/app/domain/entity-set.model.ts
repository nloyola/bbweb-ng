import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { EntityInfo, IEntityInfo } from './entity-info.model';
import { HasSlug } from './has-slug.model';
import { HasName } from './has-name.model';

export interface IEntitySet<T extends IDomainEntity & HasSlug & HasName> {

  entityData: IEntityInfo<T>[];

}

export class EntitySet<T extends IDomainEntity & HasSlug & HasName>
  extends DomainEntity implements IEntitySet<T> {

  allEntities: boolean;

  entityData: IEntityInfo<T>[];

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
