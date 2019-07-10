import { SearchFilter } from '@app/domain/search-filters/search-filter.model';

/**
 * A VisitNumber aids in using the search API provided by the Biobank REST API.
 */
export class VisitNumberFilter extends SearchFilter {

  constructor() {
    super(VisitNumberFilter.name);
  }

  getValue(): string {
    if (this.value !== '') {
      return 'visitNumber:eq:' + this.value;
    }
    return '';
  }

}
