import { AccessItem, IAccessItem } from './access-item.model';
import { JSONObject } from '@app/domain';

export class UserRole extends AccessItem implements IAccessItem {

  hasAnyRoleOf(...roleIds: string[]) {
    const ids = Array.of(this.id).concat(this.childData.map(info => info.id));
    return roleIds.filter(id => ids.includes(id)).length > 0;
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);
    return this;
  }

}
