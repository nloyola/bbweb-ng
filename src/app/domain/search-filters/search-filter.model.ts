 /**
 * SearchFilter's aid in using the search API provided by the Biobank REST API.
 *
 * @memberOf domain.filters
 */
export class SearchFilter {

  /**
   * The value to use for this filter.
   */
  value: string = '';

  /**
   * @param name - the name of the filter.
   */
  constructor(public name: string) {

  }

  setValue(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  clearValue() {
    this.setValue('');
  }
}
