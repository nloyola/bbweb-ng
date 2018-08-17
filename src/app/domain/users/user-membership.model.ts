import { DomainEntity } from '@app/domain/domain-entity.model';

export class UserMembership extends DomainEntity {

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

}
