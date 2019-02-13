import { DomainEntity } from './domain-entity.model';

export class EntityNameAndState<T> extends DomainEntity {

  id: string;

  slug: string;

  name: string;

  state: T;

}
