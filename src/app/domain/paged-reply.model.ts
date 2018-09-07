import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { SearchParams } from '@app/domain';

/**
 * Object returned by server for a paged API call.
 */
export class PagedReply<T extends ConcurrencySafeEntity> {

  constructor(

    /** The search parameters (i.e.query string) used to generate the reply. */
    public searchParams: SearchParams,

    /** The items in the page. */
    public entities: T[],

    /** The page offset. Starts at 0. */
    public offset: number,

    /** The total number of entities in all pages. */
    public total: number) { }

}
