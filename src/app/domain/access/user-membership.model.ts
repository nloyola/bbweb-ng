import { IMembershipBase, MembershipBase } from './membership-base.model';

export type IUserMembership = IMembershipBase;

export class UserMembership extends MembershipBase implements IUserMembership { }
