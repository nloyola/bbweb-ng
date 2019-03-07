import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedReply, SearchParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserCounts } from '@app/domain/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly BASE_URL = '/api/users';

  private stateActions = [ 'activate', 'lock', 'unlock' ];

  constructor(private http: HttpClient) {}

  passwordReset(email: string) {
    return this.http.post<any>(this.BASE_URL + '/passreset', { email });
  }

  /**
  * Retrieves the counts of all Users from the server indexed by state.
  */
  counts(): Observable<UserCounts> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/counts`)
      .pipe(
        map((reply: ApiReply) => {
          if (reply && reply.data) {
            return {
              ...reply.data
            };
          }
          throw new Error('expected a user object');
        }));
  }

  /**
  * Retrieves a User from the server.
  *
  * @param {string} slug the slug of the user to retrieve.
  */
  get(slug: string): Observable<User> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`)
      .pipe(
        delay(2000),
        map(this.replyToUser));
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
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`,
                                   { params: searchParams.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          if (reply && reply.data && reply.data.items) {
            const entities: User[] = reply.data.items.map((obj: any) => new User().deserialize(obj));
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

  update(user: User, attributeName: string, newValue: any): Observable<User> {
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
          newValue: {
            currentPassword: newValue.currentPassword,
            newPassword: newValue.newPassword
          }
        } as any;
        break;
      case 'state':
        if (!this.stateActions.includes(newValue)) {
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
      return new User().deserialize(reply.data);
    }
    throw new Error('expected a user object');
  }
}
