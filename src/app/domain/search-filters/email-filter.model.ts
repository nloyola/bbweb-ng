import { SearchFilter } from '@app/domain/search-filters/search-filter.model';

/**
 * An EmailFilter aids in using the search API provided by the Biobank REST API.
 */
export class EmailFilter extends SearchFilter {
  constructor() {
    super(EmailFilter.name);
  }

  getValue(): string {
    if (this.value !== '') {
      return 'email:like:' + this.value;
    }
    return '';
  }
}
