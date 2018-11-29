import { SearchParams, DomainEntity, ConcurrencySafeEntity } from '@app/domain';

export interface PagedReplyBase {

  searchParams: SearchParams;

  /** The page offset. Starts at 0. */
  offset: number;

  /** The total number of entities in all pages. */
  total: number;

  /** The maximum number of pages. */
  maxPages: number;
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

export interface PagedReplyInfo<T extends DomainEntity> {
  hasNoEntitiesToDisplay: boolean;
  hasNoResultsToDisplay: boolean;
  hasResultsToDisplay: boolean;
  entities: T[];
  total: number;
  maxPages: number;
  showPagination: boolean;
}
