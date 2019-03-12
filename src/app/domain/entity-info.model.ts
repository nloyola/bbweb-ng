import { IDomainEntity, DomainEntity } from './domain-entity.model';
import { HasSlug } from './has-slug.model';
import { HasName } from './has-name.model';

export type IEntityInfo<T extends IDomainEntity & HasSlug & HasName> = Pick<T, 'id' | 'slug' | 'name' >;

export class EntityInfo<T extends IDomainEntity & HasSlug & HasName>
  extends DomainEntity implements IEntityInfo<T> {

  id: string;
  slug: string;
  name: string;

}
