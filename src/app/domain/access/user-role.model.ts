import { AccessItem, IAccessItem } from './access-item.model';
import { JSONObject } from '@app/domain';

export type IUserRole = IAccessItem;

export class UserRole extends AccessItem implements IUserRole {

  hasAnyRoleOf(...roleIds: string[]) {
    const ids = Array.of(this.id).concat(this.childData.map(info => info.id));
    return roleIds.filter(id => ids.includes(id)).length > 0;
  }

  // deserialize(input: IUserRole): this {
  //   super.deserialize(input);
  //   return this;
  // }

}
