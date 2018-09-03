export enum StudyState {
  /**
   * This is the initial state for a study.  In this state, only configuration changes are allowed.
   * Collection and processing of specimens cannot be recorded.
   */
  Disabled = 'disabled',

  /**
   * When a study is in this state, collection and processing of specimens can be recorded.
    */
  Enabled = 'enabled',

  /**
   *  In this state, the study cannot be modified and collection and processing of specimens is not allowed.
    */
  Retired = 'retired'
}
