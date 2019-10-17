import { IDomainEntity, DomainEntity } from './domain-entity.model';
import { HasSlug } from './has-slug.model';
import { HasName } from './has-name.model';

export type IEntityInfo<T extends IDomainEntity & HasSlug> = Pick<T, 'id' | 'slug'>;

export type INamedEntityInfo<T extends IDomainEntity & HasSlug & HasName> = Pick<T, 'id' | 'slug' | 'name'>;

export class EntityInfo<T extends IDomainEntity & HasSlug> extends DomainEntity implements IEntityInfo<T> {
  id: string;
  slug: string;

  deserialize(input: IEntityInfo<T>): this {
    const { slug } = input;
    Object.assign(this, { slug });
    super.deserialize(input);
    return this;
  }
}

export class NamedEntityInfo<T extends IDomainEntity & HasSlug & HasName> extends EntityInfo<T>
  implements INamedEntityInfo<T> {
  name: string;

  deserialize(input: INamedEntityInfo<T>): this {
    const { slug, name } = input;
    Object.assign(this, { slug, name });
    super.deserialize(input);
    return this;
  }
}
