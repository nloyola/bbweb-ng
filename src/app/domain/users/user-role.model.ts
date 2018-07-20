import { EntityInfo } from '@app/domain/entity-info.model';

export class UserRole extends DomainEntity {

  slug: string
  name: string
  description: string
  childData: EntityInfo[]

  hasAnyRoleOf(...roleIds) {
    const ids = Array.of(this.id).concat(this.childData.map(info => info.id));
    return roleIds.filter(id => ids.includes(id)).length > 0;
  }

}
