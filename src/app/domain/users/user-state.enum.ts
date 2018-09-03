export enum UserState {
  /**
   * A user that just registered with the system. This user does not yet have full access
   * the system.
   */
  Registered = 'registered',

  /**
   * A user that has access to the system.
   */
  Active = 'active',

  /**
   * A user who no longer has access to the system.
   */
  Locked = 'locked'
}
