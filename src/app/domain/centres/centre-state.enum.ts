export enum CentreState {
  /**
   * This is the initial state for a centre.  In this state, only configuration changes are allowed.
   */
  Disabled = 'disabled',

  /**
   * When a centre is in this state, collection and processing of specimens can be recorded.
    */
  Enabled = 'enabled'
}
