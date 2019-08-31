/**
 * The states a {@link domain.participants.Specimen Specimen} can have.
 */
export enum SpecimenState {
  /** the {@link app.domain.participants.Specimen Specimen} is available for processing */
  USABLE = 'usable',

  /** the {@link app.domain.participants.Specimen Specimen} is no longer available for processing */
  UNUSABLE = 'unusable'
}
