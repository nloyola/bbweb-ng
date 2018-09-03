import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiReply } from '@app/domain/api-reply.model';
import { Study } from '@app/domain/studies';
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
   * @param {SearchParams} options - The options to use to search for studies.
   *
   * @returns The studies within a PagedReply.
   */
  search(options: SearchParams = {}): Observable<PagedReply<Study>> {
    let params = new HttpParams();

    if (options.filter) {
      params = params.set('filter', options.filter);
    }

    if (options.sort) {
      params = params.set('sort', options.sort);
    }

    if (options.page) {
      params = params.set('page', String(options.page));
    }

    if (options.limit) {
      params = params.set('limit', String(options.limit));
    }

    return this.http.get<ApiReply>(`${this.BASE_URL}/search`, { params })
      .pipe(map((reply: ApiReply) => {
        if (reply && reply.data && reply.data.items) {
          const entities: Study[] = reply.data.items.map(obj => new Study().deserialize(obj));
          return new PagedReply<Study>(entities,
                                       reply.data.page,
                                       reply.data.limit,
                                       reply.data.offset,
                                       reply.data.total);
        }
        throw new Error('expected a paged reply');
      }));
  }
}
