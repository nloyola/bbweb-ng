import { IDomainEntity } from './domain-entity.model';
import { INamedEntityInfo, NamedEntityInfo } from './entity-info.model';
import { HasName } from './has-name.model';
import { HasSlug } from './has-slug.model';

export interface IEntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S>
  extends INamedEntityInfo<T> {
  state: S;
}

export class EntityInfoAndState<T extends IDomainEntity & HasSlug & HasName, S> extends NamedEntityInfo<T>
  implements IEntityInfoAndState<T, S> {
  state: S;

  deserialize(input: IEntityInfoAndState<T, S>): this {
    const { state } = input;
    Object.assign(this, { state });
    super.deserialize(input);
    return this;
  }
}
