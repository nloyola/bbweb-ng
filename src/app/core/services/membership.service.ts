import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  PagedReply,
  SearchParams,
  JSONObject,
  JSONArray,
  JSONValue,
  searchParamsToHttpParams
} from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Membership } from '@app/domain/access';

export type MembershipUpdateAttribute =
  | 'name'
  | 'description'
  | 'userAdd'
  | 'userRemove'
  | 'allStudies'
  | 'studyAdd'
  | 'studyRemove'
  | 'allCentres'
  | 'centreAdd'
  | 'centreRemove';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  readonly BASE_URL = '/api/access/memberships';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a Membership from the server.
   *
   * @param {string} slug the slug of the membership to retrieve.
   */
  get(slug: string): Observable<Membership> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`).pipe(
      delay(2000),
      map(this.replyToMembership)
    );
  }

  /**
   * Used to search memberships.
   *
   * <p>A paged API is used to list memberships. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for memberships.
   *p
   * @returns The memberships within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Membership>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}`, { params }).pipe(
      // delay(2000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: Membership[] = (jObj.items as JSONArray).map((obj: JSONObject) =>
            new Membership().deserialize(obj as any)
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

  add(membership: Membership): Observable<Membership> {
    const json = {
      name: membership.name,
      description: membership.description ? membership.description : null,
      userIds: [],
      allStudies: true,
      studyIds: [],
      allCentres: true,
      centreIds: []
    };
    return this.http.post<ApiReply>(this.BASE_URL, json).pipe(
      // delay(2000),
      map(this.replyToMembership)
    );
  }

  update(
    membership: Membership,
    attributeName: MembershipUpdateAttribute,
    newValue?: string
  ): Observable<Membership> {
    switch (attributeName) {
      case 'name':
      case 'description': {
        const url = `${this.BASE_URL}/${attributeName}/${membership.id}`;
        const json = { expectedVersion: membership.version };
        json[attributeName] = newValue;
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'userAdd': {
        const url = `${this.BASE_URL}/user/${membership.id}`;
        const json = {
          expectedVersion: membership.version,
          userId: newValue
        };
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'userRemove': {
        const url = `${this.BASE_URL}/user/${membership.id}/${membership.version}/${newValue}`;
        return this.http.delete<ApiReply>(url).pipe(map(this.replyToMembership));
      }

      case 'allStudies': {
        const url = `${this.BASE_URL}/allStudies/${membership.id}`;
        const json = { expectedVersion: membership.version };
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'studyAdd': {
        const url = `${this.BASE_URL}/study/${membership.id}`;
        const json = {
          expectedVersion: membership.version,
          studyId: newValue
        };
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'studyRemove': {
        const url = `${this.BASE_URL}/study/${membership.id}/${membership.version}/${newValue}`;
        return this.http.delete<ApiReply>(url).pipe(map(this.replyToMembership));
      }

      case 'allCentres': {
        const url = `${this.BASE_URL}/allCentres/${membership.id}`;
        const json = { expectedVersion: membership.version };
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'centreAdd': {
        const url = `${this.BASE_URL}/centre/${membership.id}`;
        const json = {
          expectedVersion: membership.version,
          centreId: newValue
        };
        return this.http.post<ApiReply>(url, json).pipe(map(this.replyToMembership));
      }

      case 'centreRemove': {
        const url = `${this.BASE_URL}/centre/${membership.id}/${membership.version}/${newValue}`;
        return this.http.delete<ApiReply>(url).pipe(map(this.replyToMembership));
      }

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }
  }

  removeMembership(membership: Membership): Observable<string> {
    const url = `${this.BASE_URL}/${membership.id}/${membership.version}`;
    return this.http.delete<ApiReply>(url).pipe(
      // delay(5000),
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          return membership.id;
        }
        throw new Error('expected a valid reply');
      })
    );
  }

  private replyToMembership(reply: ApiReply): Membership {
    if (reply && reply.data) {
      return new Membership().deserialize(reply.data as any);
    }
    throw new Error('expected a membership object');
  }
}
