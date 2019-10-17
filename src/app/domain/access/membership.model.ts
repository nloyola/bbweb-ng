import { NamedEntityInfo, JSONObject, JSONArray } from '@app/domain';
import { IUserInfo, UserInfo } from '@app/domain/users';
import { MembershipBase, IMembershipBase } from './membership-base.model';

export interface IMembership extends IMembershipBase {
  /**
   * This users associated with this membership.
   */
  userData: IUserInfo[];
}

export class Membership extends MembershipBase {
  userData: UserInfo[];

  deserialize(input: IMembership): this {
    super.deserialize(input);
    if (input.userData) {
      this.userData = input.userData.map(ui => new NamedEntityInfo().deserialize(ui));
    }
    return this;
  }
}
