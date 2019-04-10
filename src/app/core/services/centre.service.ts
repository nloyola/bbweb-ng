import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location, PagedReply, SearchParams, JSONArray, JSONValue, JSONObject } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Centre, CentreCounts } from '@app/domain/centres';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export type CentreUpdateAttribute =
  'name'
  | 'description'
  | 'studyAdd'
  | 'studyRemove'
  | 'locationAdd'
  | 'locationRemove'
  | 'state';

@Injectable({
  providedIn: 'root'
})
export class CentreService {

  readonly BASE_URL = '/api/centres';

  private stateActions = [ 'disable', 'enable' ];

  constructor(private http: HttpClient) {
  }

  /**
  * Retrieves the counts of all Centres from the server indexed by state.
  */
  counts(): Observable<CentreCounts> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/counts`)
      .pipe(
        map((reply: ApiReply) => {
          if (reply && reply.data) {
            const jObj = reply.data as JSONObject;
            return {
              total: jObj.total as number,
              disabledCount: jObj.disabledCount as number,
              enabledCount: jObj.enabledCount as number
            };
          }
          throw new Error('expected a centre object');
        }));
  }

  /**
  * Retrieves a Centre from the server.
  *
  * @param {string} slug the slug of the centre to retrieve.
  */
  get(slug: string): Observable<Centre> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`)
      .pipe(map(this.replyToCentre));
  }

  /**
   * Used to search centres.
   *
   * <p>A paged API is used to list centres. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for centres.
   *
   * @returns The centres within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Centre>> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`,
                                   { params: searchParams.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          const jObj = reply.data as JSONObject;
          if (reply && reply.data && jObj.items) {
            const entities: Centre[] = (jObj.items as JSONArray)
              .map((obj: JSONObject) => new Centre().deserialize(obj));

            return {
              searchParams,
              entities,
              offset: jObj.offset as number,
              total: jObj.total as number,
              maxPages: jObj.maxPages as number
            };
          }
          throw new Error('expected a paged reply');
        }));
  }

  add(centre: Centre): Observable<Centre> {
    const json = {
      name: centre.name,
      description: centre.description ? centre.description : null
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json)
      .pipe(
        // delay(2000),
        map(this.replyToCentre));
  }

  update(
    centre: Centre,
    attributeName: CentreUpdateAttribute,
    value: string | Location
  ): Observable<Centre> {
    let url: string;
    let json = { expectedVersion: centre.version };

    switch (attributeName) {
      case 'name':
        json = { ...json, name: value } as any;
        url = `${this.BASE_URL}/name/${centre.id}`;
        break;

      case 'description':
        json = { ...json, description: value } as any;
        url = `${this.BASE_URL}/description/${centre.id}`;
        break;

      case 'studyAdd':
        json['studyId'] = value;
        url = `${this.BASE_URL}/studies/${centre.id}`;
        break;

      case 'studyRemove':
        url = `${this.BASE_URL}/studies/${centre.id}/${centre.version}/${value}`;
        break;

      case 'locationAdd': {
        const location = value as Location;
        json['location'] = location;
        url = `${this.BASE_URL}/locations/${centre.id}`;
        if (!location.isNew()) {
          url += '/' + location.id;
        }
        break;
      }

      case 'locationRemove': {
        const location = value as Location;
        url = `${this.BASE_URL}/locations/${centre.id}/${centre.version}/${location.id}`;
        break;
      }

      case 'state':
        const stateAction = value as string;
        if (!this.stateActions.includes(stateAction)) {
          throw new Error('invalid state change for centre: ' + stateAction);
        }
        url = `${this.BASE_URL}/${stateAction}/${centre.id}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    if (['studyRemove', 'locationRemove'].includes(attributeName)) {
      return this.http.delete<ApiReply>(url).pipe(map(this.replyToCentre));
    }
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToCentre));
  }

  private replyToCentre(reply: ApiReply): Centre {
    if (reply && reply.data) {
      return new Centre().deserialize(reply.data as JSONObject);
    }
    throw new Error('expected a centre object');
  }
}
