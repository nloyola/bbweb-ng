import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { EntityInfo } from '@app/domain/entity-info.model';
import { RoleIds } from '@app/domain/access';
import { UserState } from '@app/domain/users/user-state.model';
import { UserRole } from '@app/domain/users/user-role.model';
import { UserMembership } from '@app/domain/users/user-membership.model';

/**
 * Information for a user of the system.
 * @extends domain.ConcurrencySafeEntity
 * @memberOf domain.users
 */
export class User extends ConcurrencySafeEntity {
  /**
   * The user's full name.
   */
  name: string

  /**
   * The user's email address.
   */
  email: string

  /**
   * The user's optional avatar URL.
   */
  avatarUrl: string

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

  hasRole(roleId) {
    const hasRole = this.roles.find(role => role.id === roleId);
    if (hasRole) {
      return true;
    }
    return this.roles
      .filter(role => role.childData.find(childInfo => childInfo.id === roleId))
      .length > 0;
  }

  hasAnyRoleOf(...roleIds) {
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
    Object.assign(this, input);
    if (input.roles) {
      this.roles = input.roles.map(role => new UserRole().deserialize(role));
    }

    if (input.membership) {
      this.membership = new UserMembership().deserialize(input.membership);
    }
    return this;
  }

  // register(password) {
  //   var json = {
  //     name: this.name,
  //     email: this.email,
  //     password: password,
  //     avatarUrl: this.avatarUrl
  //   };
  //   return biobankApi.post(User.url(''), json).then(User.asyncCreate);
  // }

  // /** @protected */
  // update(url, additionalJson) {
  //   return super.update(url, additionalJson).then(User.asyncCreate);
  // }

  // updateName(name) {
  //   return this.update(User.url('update', this.id), { property: 'name', newValue: name });
  // }

  // updateEmail(email) {
  //   return this.update(User.url('update', this.id), { property: 'email', newValue: email });
  // }

  // updatePassword(currentPassword, newPassword) {
  //   return this.update(User.url('update', this.id),
  //     {
  //       property: 'password',
  //       newValue: {
  //         currentPassword: currentPassword,
  //         newPassword: newPassword
  //       }
  //     });
  // }

  // updateAvatarUrl(avatarUrl) {
  //   return this.update(User.url('update', this.id), { property: 'avatarUrl', newValue: avatarUrl });
  // }

  // activate() {
  //   if (this.state !== UserState.Registered) {
  //     throw new DomainError('user state is not registered: ' + this.state);
  //   }
  //   return this.update(User.url('update', this.id), { property: 'state', newValue: 'activate' });
  // }

  // lock() {
  //   if ((this.state !== UserState.Registered) && (this.state !== UserState.Active)) {
  //     throw new DomainError('user state is not registered or active: ' + this.state);
  //   }
  //   return this.update(User.url('update', this.id), { property: 'state', newValue: 'lock' });
  // }

  // unlock() {
  //   if (this.state !== UserState.LOCKED) {
  //     throw new DomainError('user state is not locked: ' + this.state);
  //   }
  //   return this.update(User.url('update', this.id), { property: 'state', newValue: 'unlock' });
  // }

  // addRole(roleId) {
  //   if (this.roles.find(role => role.id === roleId) !== undefined) {
  //     throw new DomainError('user already has role: ' + roleId);
  //   }
  //   return this.update(User.url('roles', this.id),
  //     {
  //       expectedVersion: this.version,
  //       roleId: roleId
  //     });
  // }

  // /**
  //  * @return {Promise<domain.users.User>} The user with the role removed.
  //  */
  // removeRole(roleId) {
  //   if (this.roles.find(role => role.id === roleId) === undefined) {
  //     return $q.reject('user does not have role: ' + roleId);
  //   }
  //   return biobankApi.del(User.url('roles', this.id, this.version, roleId))
  //     .then(User.asyncCreate);
  // }

  // addMembership(membershipId) {
  //   return this.update(User.url('memberships', this.id),
  //     {
  //       expectedVersion: this.version,
  //       membershipId: membershipId
  //     });
  // }

  // /**
  //  * @return {Promise<domain.users.User>} The user with the membership removed.
  //  */
  // removeMembership(membershipId) {
  //   return biobankApi.del(User.url('memberships', this.id, this.version, membershipId))
  //     .then(User.asyncCreate);
  // }

  // /**
  //  * Retrieves a User from the server.
  //  *
  //  * @param {string} slug the slug for the user to retrieve.
  //  *
  //  * @returns {Promise<domain.users.User>} The user within a promise.
  //  */
  // static get(slug) {
  //   return biobankApi.get(User.url(slug)).then(User.asyncCreate);
  // }

  // /**
  //  * Used to list users.
  //  *
  //  * @param {object} options - The options to use.
  //  *
  //  * @param {string} options.filter The filter expression to use on user to refine the list.
  //  *
  //  * @param {string} options.sort Users can be sorted by 'name', 'email' or by 'state'. Values other
  //  * than these yield an error. Use a minus sign prefix to sort in descending order.
  //  *
  //  * @param {int} options.page If the total results are longer than limit, then page selects which
  //  * users should be returned. If an invalid value is used then the response is an error.
  //  *
  //  * @param {int} options.limit The total number of users to return per page. The maximum page size is
  //  * 10. If a value larger than 10 is used then the response is an error.
  //  *
  //  * @returns {Promise<common.controllers.PagedListController.PagedResult>} with items of type {@link
  //  * domain.users.User}.
  //  */
  // static list(options) {
  //   var validKeys = ['filter',
  //     'sort',
  //     'page',
  //     'limit'
  //   ],
  //     params;

  //   options = options || {};
  //   params = _.omitBy(_.pick(options, validKeys), function(value) {
  //     return value === '';
  //   });

  //   return biobankApi.get(User.url('search'), params).then(function(reply) {
  //     // reply is a paged result
  //     var deferred = $q.defer();
  //     try {
  //       reply.items = reply.items.map((obj) => User.create(obj));
  //       deferred.resolve(reply);
  //     } catch (e) {
  //       deferred.reject('invalid users from server');
  //     }
  //     return deferred.promise;
  //   });
  // }
}
