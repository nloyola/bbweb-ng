import { ConcurrencySafeEntity } from "@app/domain/concurrency-safe-entity.model";

/**
 * Object returned by server for a paged API call.
 */
export class PagedReply<T extends ConcurrencySafeEntity> {

  constructor(
    /** The items in the page. */
    public entities: T[],

    /** The page these entities belong to */
    public page: number,

    /** The number of entities in this page. */
    public limit: number,

    /** The page offset. Starts at 0. */
    public offset: number,

    /** The total number of entities in all pages. */
    public total: number) { };

}
