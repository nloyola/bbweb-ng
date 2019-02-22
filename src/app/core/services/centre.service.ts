import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location, PagedReply, SearchParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Centre, CentreCounts, CentreToAdd } from '@app/domain/centres';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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
            return {
              ...reply.data
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
          if (reply && reply.data && reply.data.items) {
            const entities: Centre[] = reply.data.items.map((obj: any) => new Centre().deserialize(obj));
            return {
              searchParams,
              entities,
              offset: reply.data.offset,
              total: reply.data.total,
              maxPages: reply.data.maxPages
            };
          }
          throw new Error('expected a paged reply');
        }));
  }

  add(centre: CentreToAdd): Observable<Centre> {
    const json = {
      name: centre.name,
      description: centre.description ? centre.description : null
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json)
      .pipe(
        // delay(2000),
        map(this.replyToCentre));
  }

  update(centre: Centre, attributeName: string, value: string): Observable<Centre> {
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
      case 'state':
        if (!this.stateActions.includes(value)) {
          throw new Error('invalid state change for centre: ' + value);
        }
        url = `${this.BASE_URL}/${value}/${centre.id}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToCentre));
  }

  addStudy(centre: Centre, studyId: string): Observable<Centre> {
    const studyName = centre.studyNames.find(sn => sn.id === studyId);
    if (studyName !== undefined) {
      throw new Error(`study ID already present: ${studyId}`);
    }

    const json = {
      studyId,
      expectedVersion: centre.version
    };

    return this.http.post<ApiReply>(`${this.BASE_URL}/studies/${centre.id}`, json)
      .pipe(map(this.replyToCentre));
  }

  removeStudy(centre: Centre, studyId: string): Observable<Centre> {
    const studyName = centre.studyNames.find(sn => sn.id === studyId);
    if (studyName === undefined) {
      throw new Error(`study ID not present: ${studyId}`);
    }

    return this.http.delete<ApiReply>(
      `${this.BASE_URL}/studies/${centre.id}/${centre.version}/${studyId}`)
      .pipe(map(this.replyToCentre));
  }

  addOrUpdateLocation(centre: Centre, location: Location): Observable<Centre> {
    const json = {
      ...location,
      expectedVersion: centre.version
    };
    let url = `${this.BASE_URL}/locations/${centre.id}`;
    if (!location.isNew()) {
      url += '/' + location.id;
    }
    return this.http.post<ApiReply>(url, json).pipe(
      // delay(2000),
      map(this.replyToCentre));
  }

  removeLocation(centre: Centre, locationId: string): Observable<Centre> {
    const location = centre.locations.find(loc => loc.id === locationId);
    if (location === undefined) {
      throw new Error(`location ID not present: ${locationId}`);
    }

    const url = `${this.BASE_URL}/locations/${centre.id}/${centre.version}/${locationId}`;
    return this.http.delete<ApiReply>(url)
      .pipe(map(this.replyToCentre));
  }

  private replyToCentre(reply: ApiReply): Centre {
    if (reply && reply.data) {
      return new Centre().deserialize(reply.data);
    }
    throw new Error('expected a centre object');
  }
}
