import { IDomainEntity } from './domain-entity.model';
import { EntityInfo, IEntityInfo } from './entity-info.model';
import { HasName } from './has-name.model';
import { HasSlug } from './has-slug.model';

export interface IEntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S> extends IEntityInfo<T> {
  state: S;
}

export class EntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S> extends EntityInfo<T>
  implements IEntityInfoAndState<T, S> {
  state: S;

  deserialize(input: IEntityInfoAndState<T, S>): this {
    const { state } = input;
    Object.assign(this, { state });
    super.deserialize(input);
    return this;
  }
}
