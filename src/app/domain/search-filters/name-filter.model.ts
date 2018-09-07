import { SearchFilter } from "@app/domain/search-filters/search-filter.model";

/**
 * NameFilter's aid in using the search API provided by the Biobank REST API.
 */
export class NameFilter extends SearchFilter {

  constructor() {
    super(NameFilter.name);
  }

  getValue() {
    if (this.value !== '') {
      return 'name:like:' + this.value;
    }
    return '';
  }
}
