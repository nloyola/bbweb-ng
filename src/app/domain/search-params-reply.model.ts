import { SearchParams } from './search-params.model';

export interface SearchParamsReply {

  entityIds?: string[];

  searchParams?: SearchParams;

  offset?: number;

  total?: number;

}
