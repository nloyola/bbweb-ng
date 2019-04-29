import { HttpParams } from '@angular/common/http';

/**
 * Options used to search for entities.
 */
export class SearchParams {

  private params: HttpParams;

  constructor(
    /** The filter to use on the entity attributes. */
    public filter?: string,

    /**
     * The field to sort the entities by. Use a minus sign prefix to sort in descending order.
     */
    public sort?: string,

    /**
     * If the total number of entities are greater than limit, then page selects which entities
     * should be returned. If an invalid value is used then the response is an error.
     */
    public page?: number,

    /** The number of entities to return per page. */
    public limit?: number
  ) {

    this.params = new HttpParams();

    if (this.filter) {
      this.params = this.params.set('filter', this.filter);
    }

    if (this.sort) {
      this.params = this.params.set('sort', this.sort);
    }

    if (this.page) {
      this.params = this.params.set('page', String(this.page));
    }

    if (this.limit) {
      this.params = this.params.set('limit', String(this.limit));
    }
  }

  httpParams(): HttpParams {
    return this.params;
  }

  queryString(): string {
    return this.params.toString();
  }

}
