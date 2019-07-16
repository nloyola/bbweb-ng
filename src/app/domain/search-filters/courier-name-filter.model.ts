import { SearchFilter } from '@app/domain/search-filters/search-filter.model';

/**
 * A NameFilter aids in using the search API provided by the Biobank REST API.
 */
export class CourierNameFilter extends SearchFilter {
  constructor() {
    super(CourierNameFilter.name);
  }

  getValue(): string {
    if (this.value !== '') {
      return 'courierName:like:' + this.value;
    }
    return '';
  }
}
