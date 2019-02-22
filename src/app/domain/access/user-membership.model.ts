import { MembershipBase } from './membership-base.model';

export class UserMembership extends MembershipBase {

  deserialize(input: any) {
    super.deserialize(input);
    return this;
  }

}
