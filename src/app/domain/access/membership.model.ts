import { EntityInfo } from '@app/domain';
import { MembershipBase } from './membership-base.model';

export class Membership extends MembershipBase {

  /**
   * This users associated with this membership.
   */
  userData: EntityInfo[];

  deserialize(input: any) {
    super.deserialize(input);
    if (input.userData) {
      this.userData = input.userData.map((ui: any) => new EntityInfo().deserialize(ui));
    }
    return this;
  }

}