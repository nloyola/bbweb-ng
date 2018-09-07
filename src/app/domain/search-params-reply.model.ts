import { SearchParams } from './search-params.model';

export interface SearchParamsReply extends SearchParams {

  entityIds?: string[];

  offset?: number;

  total?: number;

}
