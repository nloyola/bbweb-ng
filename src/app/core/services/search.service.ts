import { Observable } from 'rxjs';
import {
  ConcurrencySafeEntity,
  PagedReply,
  SearchParams
} from '@app/domain';

export interface SearchService<T extends ConcurrencySafeEntity> {

  search(options: SearchParams): Observable<PagedReply<T>>;

}
