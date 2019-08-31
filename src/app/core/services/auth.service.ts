import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthInfo } from '@app/domain/access';
import { ApiReply } from '@app/domain/api-reply.model';
import { User, IUser } from '@app/domain/users';
import { map } from 'rxjs/operators';
import { JSONObject, JSONValue } from '@app/domain';

export const AUTH_TOKEN_LOCAL_STORAGE_KEY = 'authToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly BASE_URL = '/api/users';
  private authToken: AuthInfo;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<ApiReply>(this.BASE_URL + '/login', { email, password }).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          const jObj = reply.data as JSONObject;
          if (jObj.user && jObj.token) {
            this.authToken = {
              user: new User().deserialize(jObj.user as any),
              token: jObj.token as string,
              expiresOn: new Date(jObj.expiresOn as string)
            };

            // store username and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(this.authToken));
            return this.authToken.user;
          }
        }
        throw new Error('expected an auth token object');
      })
    );
  }

  logout() {
    this.authToken = null;
    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<any>(this.BASE_URL + '/', { name, email, password })
      .pipe(map((res: JSONObject) => new User().deserialize(res.data as any)));
  }

  isLoggedIn() {
    return localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY) !== null;
  }

  getUser() {
    const jObj = JSON.parse(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)) as JSONObject;
    if (jObj) {
      this.authToken = {
        user: new User().deserialize(jObj.user as any),
        token: jObj.token as string,
        expiresOn: new Date(jObj.expiresOn as string)
      };
      return this.authToken.user;
    }
    return null;
  }

  getToken() {
    this.authToken = JSON.parse(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY));
    if (this.authToken) {
      return this.authToken.token;
    }
    return null;
  }
}
