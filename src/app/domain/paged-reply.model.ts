import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { SearchParams } from '@app/domain';

export interface PagedReplyBase {

  searchParams: SearchParams;

  /** The page offset. Starts at 0. */
  offset: number;

  /** The total number of entities in all pages. */
  total: number;
}

export interface PagedReplyEntityIds extends PagedReplyBase {

  entityIds: string[];
}

/**
 * Object returned by server for a paged API call.
 */
export interface PagedReply<T extends ConcurrencySafeEntity> extends PagedReplyBase {

  /** The items in the page. */
  entities: T[],

}
