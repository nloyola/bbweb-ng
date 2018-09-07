import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { ApiReply } from '@app/domain/api-reply.model';
import { Study, StudyCounts } from '@app/domain/studies';
import { PagedReply, SearchParams } from '@app/domain';
import { SearchService } from '@app/core/services/search.service';

@Injectable({
  providedIn: 'root'
})
export class StudyService implements SearchService<Study> {

  readonly BASE_URL = '/api/studies';

  constructor(private http: HttpClient) {
  }

  /**
  * Retrieves the counts of all Studies from the server indexed by state.
  */
  counts(): Observable<StudyCounts> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/counts`)
      .pipe(
        map((reply: ApiReply) => {
          if (reply && reply.data) {
            return {
              ...reply.data
            };
          }
          throw new Error('expected a study object');
        }));
  }

  /**
  * Retrieves a Study from the server.
  *
  * @param {string} slug the slug of the study to retrieve.
  */
  get(slug: string): Observable<Study> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`)
      .pipe(map((reply: ApiReply) => {
        if (reply && reply.data) {
          return new Study().deserialize(reply.data);
        }
        throw new Error('expected a study object');
      }));
  }

  /**
   * Used to search studies.
   *
   * <p>A paged API is used to list studies. See below for more details.</p>
   *
   * @param params - The options to use to search for studies.
   *
   * @returns The studies within a PagedReply.
   */
  search(params: SearchParams): Observable<PagedReply<Study>> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`,
                                   { params: params.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          if (reply && reply.data && reply.data.items) {
            const entities: Study[] = reply.data.items.map(obj => new Study().deserialize(obj));
            return new PagedReply<Study>(params,
                                         entities,
                                         reply.data.offset,
                                         reply.data.total);
          }
          throw new Error('expected a paged reply');
        }));
  }

  add(study: Study): Observable<Study> {
    const json = {
      name: study.name,
      description: study.description ? study.description : null
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json)
      .pipe(map((reply: ApiReply) => {
        if (reply && reply.data) {
          return new Study().deserialize(reply.data);
        }
        throw new Error('expected a study object');
      }));
  }
}
