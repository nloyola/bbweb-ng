import { DomainEntity } from './domain-entity.model';

export class EntityInfo extends DomainEntity {

  slug: string;

  name: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
