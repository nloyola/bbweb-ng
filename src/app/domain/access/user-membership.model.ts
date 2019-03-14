import { MembershipBase, IMembershipBase } from './membership-base.model';
import { JSONObject } from '@app/domain';

export class UserMembership extends MembershipBase implements IMembershipBase {

  deserialize(input: JSONObject) {
    super.deserialize(input);
    return this;
  }

}
