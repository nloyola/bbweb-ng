import { AccessItem } from '../access/access-item.model';
import { EntityInfo } from '..';

export class Role extends AccessItem {

  /**
   * The users that have this role.
   */
  userData: EntityInfo[];

  deserialize(input: any) {
    super.deserialize(input);
    if (input.userData) {
      this.userData = input.userData.map((u: any) => new EntityInfo().deserialize(u));
    }
    return this;
  }

}
