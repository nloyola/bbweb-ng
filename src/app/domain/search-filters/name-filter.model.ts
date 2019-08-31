import { SearchFilter } from '@app/domain/search-filters/search-filter.model';

/**
 * A NameFilter aids in using the search API provided by the Biobank REST API.
 */
export class NameFilter extends SearchFilter {
  constructor() {
    super(NameFilter.name);
  }

  getValue(): string {
    if (this.value !== '') {
      return 'name:like:' + this.value;
    }
    return '';
  }
}
