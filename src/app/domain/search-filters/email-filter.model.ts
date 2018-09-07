import { SearchFilter } from "@app/domain/search-filters/search-filter.model";

/**
 * EmailFilter's aid in using the search API provided by the Biobank REST API.
 */
export class EmailFilter extends SearchFilter {

  constructor() {
    super(EmailFilter.name);
  }

  getValue() {
    if (this.value !== '') {
      return 'email:like:' + this.value;
    }
    return '';
  }

}
