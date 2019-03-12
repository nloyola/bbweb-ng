import { AccessItem, IAccessItem } from './access-item.model';
import { EntityInfo } from '@app/domain';
import { IUserInfo } from '@app/domain/users';

export interface IRole extends IAccessItem {

  /**
   * The users that have this role.
   */
  userData: IUserInfo[];

}

export class Role extends AccessItem implements IRole {

  userData: IUserInfo[];

  deserialize(input: any) {
    super.deserialize(input);
    if (input.userData) {
      this.userData = input.userData.map((u: any) => new EntityInfo().deserialize(u));
    }
    return this;
  }

}
