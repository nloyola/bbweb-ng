import { SearchParams, IDomainEntity } from '@app/domain';

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
export interface PagedReply<T extends IDomainEntity> extends PagedReplyBase {

  /** The items in the page. */
  entities: T[];

}

export interface PagedReplyInfoBase {
  hasNoEntitiesToDisplay: boolean;
  hasNoResultsToDisplay: boolean;
  hasResultsToDisplay: boolean;
  total: number;
  maxPages: number;
  showPagination: boolean;
}

export interface PagedReplyInfo<T extends IDomainEntity> extends PagedReplyInfoBase {
  entities: T[];
}

export function pagedReplyToInfo(reply: PagedReplyEntityIds): PagedReplyInfoBase {
  return {
    hasNoEntitiesToDisplay: ((reply.entityIds.length <= 0)
                             && (reply.searchParams.filter === '')),

    hasNoResultsToDisplay: ((reply.entityIds.length <= 0)
                            && (reply.searchParams.filter !== '')),

    hasResultsToDisplay: reply.entityIds.length > 0,
    total: reply.total,
    maxPages: reply.maxPages,
    showPagination: reply.maxPages > 1,
  };
}
