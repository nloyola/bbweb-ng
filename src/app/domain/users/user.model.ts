import { ConcurrencySafeEntity, HasSlug, HasName } from '@app/domain';
import { RoleIds, UserRole, UserMembership } from '@app/domain/access';
import { UserState } from '@app/domain/users/user-state.enum';

/**
 * Information for a user of the system.
 */
export class User extends ConcurrencySafeEntity implements HasSlug, HasName {

  slug: string;

  /**
   * The user's full name.
   */
  name: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's optional avatar URL.
   */
  avatarUrl: string;

  /**
   * Information for the roles this user has.
   */
  roles: UserRole[] = [];

  /**
   * The state can be one of: registered, active or locked.
   */
  state: UserState;

  membership: UserMembership | null;

  isRegistered() {
    return (this.state === UserState.Registered);
  }

  isActive() {
    return (this.state === UserState.Active);
  }

  isLocked() {
    return (this.state === UserState.Locked);
  }

  hasRoles() {
    return (this.roles.length > 0);
  }

  hasRole(roleId: string) {
    const hasRole = this.roles.find(role => role.id === roleId);
    if (hasRole) {
      return true;
    }
    return this.roles
      .filter(role => role.childData.find(childInfo => childInfo.id === roleId))
      .length > 0;
  }

  hasAnyRoleOf(...roleIds: string[]) {
    return this.roles.reduce((acc, role) => acc || role.hasAnyRoleOf(...roleIds), false);
  }

  hasStudyAdminRole() {
    return this.hasRole(RoleIds.StudyAdministrator);
  }

  hasCentreAdminRole() {
    return this.hasRole(RoleIds.CentreAdministrator);
  }

  hasUserAdminRole() {
    return this.hasRole(RoleIds.UserAdministrator);
  }

  hasAdminRole() {
    return this.hasAnyRoleOf(RoleIds.StudyAdministrator,
      RoleIds.CentreAdministrator,
      RoleIds.UserAdministrator);
  }

  hasSpecimenCollectorRole() {
    return this.hasRole(RoleIds.SpecimenCollector);
  }

  hasShippingUserRole() {
    return this.hasRole(RoleIds.ShippingUser);
  }

  getRoleNames() {
    return this.roles.map(role => role.name).join(', ');
  }

  hasMembership() {
    return this.membership !== undefined;
  }

  deserialize(input: any) {
    super.deserialize(input);
    if (input.roles) {
      this.roles = input.roles.map((role: any) => new UserRole().deserialize(role));
    }

    if (input.membership) {
      this.membership = new UserMembership().deserialize(input.membership);
    }
    return this;
  }


}
