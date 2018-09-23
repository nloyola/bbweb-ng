import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { ApiReply } from '@app/domain/api-reply.model';
import { AuthInfo } from '@app/domain/access';
import { User } from '@app/domain/users';

export const AUTH_TOKEN_LOCAL_STORAGE_KEY = 'authToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly BASE_URL = '/api/users';
  private authToken: AuthInfo;

  constructor(private http: HttpClient) {
  }

  login(email: string, password: string) {
    return this.http.post<ApiReply>(this.BASE_URL + '/login', { email, password })
      .pipe(map((res: ApiReply) => {
        if (res && res.data && res.data.user && res.data.token) {
          this.authToken = res.data;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(this.authToken));
          return new User().deserialize(this.authToken.user);
        }
        throw new Error('expected an auth token object');
      }));
  }

  logout() {
    this.authToken = null;
    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
  }

  register(name: string, email: string, password: string) {
    return this.http.post<any>(this.BASE_URL + '/', { name, email, password })
      .pipe(
        map((res: any) => new User().deserialize(res.data)));
  }

  isLoggedIn() {
    return localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY) !== null;
  }

  getUser() {
    this.authToken = JSON.parse(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY));
    if (this.authToken) {
      return new User().deserialize(this.authToken.user);
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
