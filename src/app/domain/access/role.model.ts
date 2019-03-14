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

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.userData) {
      this.userData = (input.userData as JSONArray)
        .map((u: JSONObject) => new EntityInfo().deserialize(u));
    }
    return this;
  }

}
