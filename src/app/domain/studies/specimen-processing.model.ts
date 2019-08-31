export interface ISpecimenProcessing {
  /**
   * The expected amount to be removed / added.
   */
  expectedChange: number;

  /**
   * The number of input / output specimens involved in processing.
   */
  count: number;

  /**
   * The container type the input / output specimens are stored in.
   */
  containerTypeId: string | null;
}
