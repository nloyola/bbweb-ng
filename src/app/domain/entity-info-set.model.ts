import { Deserializable } from './deserializable.model';
import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { INamedEntityInfo, NamedEntityInfo } from './entity-info.model';
import { HasName } from './has-name.model';
import { HasSlug } from './has-slug.model';

export interface IEntityInfoSet<T extends IDomainEntity & HasSlug & HasName> {
  allEntities: boolean;

  entityData: INamedEntityInfo<T>[];
}

export class EntityInfoSet<
  I extends IDomainEntity & HasSlug & HasName,
  T extends DomainEntity & HasSlug & HasName
> implements IEntityInfoSet<I>, Deserializable {
  allEntities: boolean;

  entityData: NamedEntityInfo<T>[];

  isContentTypeAll(): boolean {
    return this.allEntities;
  }

  isContentTypeNone(): boolean {
    return !this.allEntities && this.entityData.length <= 0;
  }

  isContentTypeSome(): boolean {
    return !this.allEntities && this.entityData.length > 0;
  }

  deserialize(input: IEntityInfoSet<I>): this {
    const { allEntities, entityData } = input;
    Object.assign(this, { allEntities });

    if (entityData) {
      this.entityData = entityData.map(ed => new NamedEntityInfo().deserialize(ed));
    }
    return this;
  }
}
