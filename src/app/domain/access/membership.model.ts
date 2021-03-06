import { EntityInfo, JSONObject, JSONArray } from '@app/domain';
import { IUserInfo } from '@app/domain/users';
import { MembershipBase } from './membership-base.model';

export class Membership extends MembershipBase {

  /**
   * This users associated with this membership.
   */
  userData: IUserInfo[];

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.userData) {
      this.userData = (input.userData as JSONArray)
        .map((ui: JSONObject) => new EntityInfo().deserialize(ui));
    }
    return this;
  }

}
