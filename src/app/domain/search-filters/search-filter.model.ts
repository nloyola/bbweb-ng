 /**
 * A SearchFilter aids in using the search API provided by the Biobank REST API.
 */
export class SearchFilter {

  /**
   * The value to use for this filter.
   */
  protected value = '';

  /**
   * @param name - the name of the filter.
   */
  constructor(public name: string) {}

  getValue(): string {
    return this.value;
  }

  setValue(value: string) {
    this.value = value;
  }

  clearValue(): void {
    this.value = '';
  }
}
