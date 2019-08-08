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
import { User, UserCounts } from '@app/domain/users';

export type UserUpdateAttribute = 'name' | 'email' | 'password' | 'avatarUrl' | 'state';

export interface PasswordUpdateValues {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly BASE_URL = '/api/users';

  private stateActions = ['activate', 'lock', 'unlock'];

  constructor(private http: HttpClient) {}

  passwordReset(email: string) {
    return this.http.post<any>(this.BASE_URL + '/passreset', { email });
  }

  /**
   * Retrieves the counts of all Users from the server indexed by state.
   */
  counts(): Observable<UserCounts> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/counts`).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          const jObj = reply.data as JSONObject;
          return {
            total: jObj.total as number,
            registeredCount: jObj.registeredCount as number,
            activeCount: jObj.activeCount as number,
            lockedCount: jObj.lockedCount as number
          };
        }
        throw new Error('expected a user object');
      })
    );
  }

  /**
   * Retrieves a User from the server.
   *
   * @param {string} slug the slug of the user to retrieve.
   */
  get(slug: string): Observable<User> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`).pipe(
      delay(2000),
      map(this.replyToUser)
    );
  }

  /**
   * Used to search users.
   *
   * <p>A paged API is used to list users. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for users.
   *p
   * @returns The users within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<User>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`, { params }).pipe(
      // delay(1000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: User[] = (jObj.items as JSONArray).map((obj: JSONObject) =>
            new User().deserialize(obj as any)
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

  update(user: User, attributeName: string, newValue: string | PasswordUpdateValues): Observable<User> {
    const url = `${this.BASE_URL}/update/${user.id}`;
    let json = { expectedVersion: user.version };

    switch (attributeName) {
      case 'name':
      case 'email':
      case 'avatarUrl':
        json = { ...json, property: attributeName, newValue } as any;
        break;
      case 'password':
        json = {
          ...json,
          property: attributeName,
          newValue
        } as any;
        break;
      case 'state':
        if (!this.stateActions.includes(newValue as string)) {
          throw new Error('invalid state change for user: ' + newValue);
        }
        json = { ...json, property: 'state', newValue } as any;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToUser));
  }

  private replyToUser(reply: ApiReply): User {
    if (reply && reply.data) {
      return new User().deserialize(reply.data as any);
    }
    throw new Error('expected a user object');
  }
}
