import { SearchFilter } from '@app/domain/search-filters/search-filter.model';

/**
 * A NameFilter aids in using the search API provided by the Biobank REST API.
 */
export class TrackingNumberFilter extends SearchFilter {
  constructor() {
    super(TrackingNumberFilter.name);
  }

  getValue(): string {
    if (this.value !== '') {
      return 'trackingNumber:like:' + this.value;
    }
    return '';
  }
}
