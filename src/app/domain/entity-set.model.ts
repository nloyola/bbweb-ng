import { Deserializable } from './deserializable.model';
import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { EntityInfo, IEntityInfo } from './entity-info.model';
import { HasName } from './has-name.model';
import { HasSlug } from './has-slug.model';

export interface IEntitySet<T extends IDomainEntity & HasSlug & HasName> {

  allEntities: boolean;

  entityData: IEntityInfo<T>[];

}

export class EntitySet<T extends DomainEntity & HasSlug & HasName>
  implements IEntitySet<T>, Deserializable {

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

    deserialize(input: IEntitySet<T>): this {
      const { allEntities, entityData } = input;
      Object.assign(this, { allEntities });

      if (entityData) {
        this.entityData = entityData.map(ed => new EntityInfo().deserialize(ed));
      }
      return this;
    }

  }
