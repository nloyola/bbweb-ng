import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, PagedReply, SearchParams, searchParamsToHttpParams } from '@app/domain';
import { Role } from '@app/domain/access';
import { ApiReply } from '@app/domain/api-reply.model';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export type RoleUpdateAttribute = 'userAdd' | 'userRemove';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  readonly BASE_URL = '/api/access/roles';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a Role from the server.
   *
   * @param {string} slug the slug of the role to retrieve.
   */
  get(slug: string): Observable<Role> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`).pipe(
      //delay(2000),
      map(this.replyToRole)
    );
  }

  /**
   * Used to search roles.
   *
   * <p>A paged API is used to list roles. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for roles.
   *p
   * @returns The roles within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Role>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}`, { params }).pipe(
      // delay(2000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: Role[] = (jObj.items as JSONArray).map((obj: JSONObject) =>
            new Role().deserialize(obj as any)
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

  update(role: Role, attributeName: RoleUpdateAttribute, newValue: string): Observable<Role> {
    const baseUrl = `${this.BASE_URL}/user/${role.id}`;

    switch (attributeName) {
      case 'userAdd':
        const json = {
          expectedVersion: role.version,
          userId: newValue
        };
        return this.http.post<ApiReply>(baseUrl, json).pipe(map(this.replyToRole));

      case 'userRemove':
        const url = `${baseUrl}/${role.version}/${newValue}`;
        return this.http.delete<ApiReply>(url).pipe(map(this.replyToRole));

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }
  }

  private replyToRole(reply: ApiReply): Role {
    if (reply && reply.data) {
      return new Role().deserialize(reply.data as any);
    }
    throw new Error('expected a role object');
  }
}
