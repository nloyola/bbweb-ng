import { AccessItem } from './access-item.model';

export class UserRole extends AccessItem {

  hasAnyRoleOf(...roleIds: string[]) {
    const ids = Array.of(this.id).concat(this.childData.map(info => info.id));
    return roleIds.filter(id => ids.includes(id)).length > 0;
  }

  deserialize(input: any) {
    super.deserialize(input);
    return this;
  }

}
