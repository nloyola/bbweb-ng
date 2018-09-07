import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';

/**
 * Object returned by server for a paged API call.
 */
export class PagedReply<T extends ConcurrencySafeEntity> {

  constructor(

    /** The filter used on the entity attributes. */
    public filter: string,

    /**
     * The field the entities are sorted by. A minus sign prefix is used to sort in descending
     * order.
     */
    public sort: string,

    /** The items in the page. */
    public entities: T[],

    /** The page these entities belong to */
    public page: number,

    /** The number of entities in this page. */
    public limit: number,

    /** The page offset. Starts at 0. */
    public offset: number,

    /** The total number of entities in all pages. */
    public total: number) { }

}
