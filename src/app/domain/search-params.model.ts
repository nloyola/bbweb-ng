/**
 * Options used to search for entities.
 */
export interface SearchParams {

  /** The filter to use on the entity attributes. */
  filter?: string;

  /**
   * The field to sort the entities by. Use a minus sign prefix to sort in descending order.
   */
  sort?: string;

  /**
   * If the total number of entities are greater than limit, then page selects which entities
   * should be returned. If an invalid value is used then the response is an error.
   */
  page?: number;

  /** The number of entities to return per page. */
  limit?: number;

}
