import { AccessItem, IAccessItem } from './access-item.model';
import { EntityInfo, JSONObject, JSONArray } from '@app/domain';
import { IUserInfo } from '@app/domain/users';

export interface IRole extends IAccessItem {
  /**
   * The users that have this role.
   */
  userData: IUserInfo[];
}

export class Role extends AccessItem implements IRole {
  userData: IUserInfo[];

  deserialize(input: IRole): this {
    super.deserialize(input);
    if (input.userData) {
      this.userData = input.userData.map(ui => new EntityInfo().deserialize(ui));
    }
    return this;
  }
}
