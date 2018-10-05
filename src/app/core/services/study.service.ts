import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchService } from '@app/core/services/search.service';
import { PagedReply, SearchParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Study, StudyCounts, StudyToAdd, StudyState } from '@app/domain/studies';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotationType } from '@app/domain/annotations';


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
      .pipe(map(this.replyToStudy));
  }

  /**
   * Used to search studies.
   *
   * <p>A paged API is used to list studies. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for studies.
   *
   * @returns The studies within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Study>> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`,
                                   { params: searchParams.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          if (reply && reply.data && reply.data.items) {
            const entities: Study[] = reply.data.items.map(obj => new Study().deserialize(obj));
            return {
              searchParams,
              entities,
              offset: reply.data.offset,
              total: reply.data.total
            };
          }
          throw new Error('expected a paged reply');
        }));
  }

  add(study: StudyToAdd): Observable<Study> {
    const json = {
      name: study.name,
      description: study.description ? study.description : null
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json)
      .pipe(map(this.replyToStudy));
  }

  update(study: Study, attributeName: string, value: string): Observable<Study> {
    let json;
    let url;

    switch (attributeName) {
      case 'name':
        json = { name: value };
        url = `${this.BASE_URL}/name/${study.id}`;
        break;
      case 'description':
        json = { description: value };
        url = `${this.BASE_URL}/description/${study.id}`;
        break;
      case 'state':
        if (!Object.values(StudyState).includes(value)) {
          throw new Error('invalid state change for study: ' + value);
        }
        json = {};
        url = `${this.BASE_URL}/${value}/${study.id}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    json['expectedVersion'] = study.version;

    return this.http.post<ApiReply>(url, json)
      .pipe(map(this.replyToStudy));
  }

  addOrUpdateAnnotationType(study: Study, annotationType: AnnotationType): Observable<Study> {
    const json = annotationType;
    let url = `${this.BASE_URL}/pannottype/${study.id}`;
    if (!annotationType.isNew()) {
      url += '/' + annotationType.id;
    }
    return this.http.post<ApiReply>(url, json)
      .pipe(map(this.replyToStudy));
  }

  removeAnnotationType(study: Study, annotationTypeId: string): Observable<Study> {
    const url = `${this.BASE_URL}/pannottype/${study.id}/${study.version}/${annotationTypeId}`;
    return this.http.delete<ApiReply>(url)
      .pipe(map(this.replyToStudy));
  }

  enableAllowed(studyId: string): Observable<any> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/enableAllowed/${studyId}`)
      .pipe(
        //delay(1000),
        map((reply: ApiReply) => {
          if (reply && (reply.data !== undefined)) {
            return {
              studyId,
              allowed: reply.data
            };
          }
          throw new Error('expected a valid response');
        }));
  }

  private replyToStudy(reply: ApiReply): Study {
    if (reply && reply.data) {
      return new Study().deserialize(reply.data);
    }
    throw new Error('expected a study object');
  }
}
