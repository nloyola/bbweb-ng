import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { IEntityInfo } from './entity-info.model';
import { HasName } from './has-name.model';
import { HasSlug } from './has-slug.model';

export interface IEntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S>
  extends IEntityInfo<T> {

  state: S;

}

export class EntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S>
  extends DomainEntity implements IEntityInfoAndState<T, S> {

  id: string;

  slug: string;

  name: string;

  state: S;

}
