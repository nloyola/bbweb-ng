import { AccessItem, IAccessItem } from './access-item.model';

export type IUserRole = IAccessItem;

export class UserRole extends AccessItem implements IUserRole {
  hasAnyRoleOf(...roleIds: string[]) {
    const ids = Array.of(this.id).concat(this.childData.map(info => info.id));
    return roleIds.filter(id => ids.includes(id)).length > 0;
  }
}
