import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ApiReply,
  PagedReply,
  SearchParams,
  JSONArray,
  JSONValue,
  JSONObject,
  searchParamsToHttpParams
} from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import {
  InputSpecimenProcessing,
  OutputSpecimenProcessing,
  ProcessedSpecimenDefinitionName,
  ProcessingType
} from '@app/domain/studies';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessingTypeService {
  readonly BASE_URL = '/api/studies/proctypes';

  private validUpdateProperties = [
    'name',
    'description',
    'enabled',
    'inputSpecimenProcessing',
    'outputSpecimenProcessing'
  ];

  constructor(private http: HttpClient) {}

  /**
   * Used to search {@link ProcessingType}s.
   *
   * <p>A paged API is used to list processing types. See below for more details.</p>
   *
   * @param searchParams - The options to use in the search.
   *
   * @returns A {@link PagedReply} observable containing the processing types.
   */
  search(studySlug: string, searchParams: SearchParams): Observable<PagedReply<ProcessingType>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}/${studySlug}`, { params }).pipe(
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: ProcessingType[] = (jObj.items as JSONArray).map((obj: JSONObject) =>
            new ProcessingType().deserialize(obj as any)
          );
          return {
            searchParams,
            entities,
            offset: jObj.offset as number,
            total: jObj.total as number,
            maxPages: jObj.maxPages as number
          };
        }
        throw new Error('expected a paged reply');
      })
    );
  }

  /**
   * Retrieves a ProcessingType from the server.
   *
   * @param studySlug The slug of the {@link Study} to retrieve.
   * @param processingTypeSlug The slug of the {@link ProcessingType} to retrieve.
   */
  get(studySlug: string, processingTypeSlug: string): Observable<ProcessingType> {
    return this.http
      .get<ApiReply>(`${this.BASE_URL}/${studySlug}/${processingTypeSlug}`)
      .pipe(map(this.replyToProcessingType));
  }

  /**
   * Retrieves a ProcessingType from the server.
   *
   * @param studyId The ID of the {@link Study} to retrieve.
   * @param processingTypeId The Id of the {@link ProcessingType} to retrieve.
   */
  getById(studyId: string, processingTypeId: string): Observable<ProcessingType> {
    return this.http
      .get<ApiReply>(`${this.BASE_URL}/id/${studyId}/${processingTypeId}`)
      .pipe(map(this.replyToProcessingType));
  }

  /**
   * Retrieves a ProcessingType from the server.
   *
   * @param slug The slug of the {@link ProcessingType} to query for.
   */
  getInUse(slug: string): Observable<any> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/inuse/${slug}`).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data !== undefined) {
          return {
            slug,
            inUse: reply.data
          };
        }
        throw new Error('expected a valid reply');
      })
    );
  }

  /**
   * Retrieves all the specimen definitions for all {@link ProcessingTypes} in a {@link Study}
   * from the server.
   *
   * @param studyId The ID of the {@link Study} to return results for.
   */
  getSpecimenDefinitionNames(studyId: string): Observable<ProcessedSpecimenDefinitionName[]> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/spcdefs/${studyId}`).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          return (reply.data as JSONArray).map((info: JSONObject) =>
            new ProcessedSpecimenDefinitionName().deserialize(info as any)
          );
        }
        throw new Error('expected a processed specimen definition names array');
      })
    );
  }

  add(processingType: ProcessingType): Observable<ProcessingType> {
    const json = {
      name: processingType.name,
      description: processingType.description,
      enabled: processingType.enabled,
      input: processingType.input,
      output: processingType.output
    };
    return this.http
      .post<ApiReply>(`${this.BASE_URL}/${processingType.studyId}`, json)
      .pipe(map(this.replyToProcessingType));
  }

  update(
    pt: ProcessingType,
    attributeName: string,
    newValue: string | boolean | InputSpecimenProcessing | OutputSpecimenProcessing
  ): Observable<ProcessingType> {
    const url = `${this.BASE_URL}/update/${pt.studyId}/${pt.id}`;

    if (!this.validUpdateProperties.includes(attributeName)) {
      throw new Error('invalid attribute name: ' + attributeName);
    }

    if (attributeName === 'description') {
      newValue = !!newValue ? newValue : '';
    }

    const json = {
      property: attributeName,
      newValue,
      expectedVersion: pt.version
    };

    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToProcessingType));
  }

  addOrUpdateAnnotationType(
    processingType: ProcessingType,
    annotationType: AnnotationType
  ): Observable<ProcessingType> {
    const json = {
      ...annotationType,
      studyId: processingType.studyId,
      expectedVersion: processingType.version
    };
    let url = `${this.BASE_URL}/annottype/${processingType.id}`;
    if (!annotationType.isNew()) {
      url += '/' + annotationType.id;
    }
    return this.http.post<ApiReply>(url, json).pipe(
      // delay(2000),
      map(this.replyToProcessingType)
    );
  }

  removeAnnotationType(pt: ProcessingType, annotationTypeId: string): Observable<ProcessingType> {
    const url = `${this.BASE_URL}/annottype/${pt.studyId}/${pt.id}/${pt.version}/${annotationTypeId}`;
    return this.http.delete<ApiReply>(url).pipe(map(this.replyToProcessingType));
  }

  removeProcessingType(pt: ProcessingType): Observable<string> {
    const url = `${this.BASE_URL}/${pt.studyId}/${pt.id}/${pt.version}`;
    return this.http.delete<ApiReply>(url).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          return pt.id;
        }
        throw new Error('expected a valid reply');
      })
    );
  }

  private replyToProcessingType(reply: ApiReply): ProcessingType {
    if (reply && reply.data) {
      return new ProcessingType().deserialize(reply.data as any);
    }
    throw new Error('expected a processing type object');
  }
}
