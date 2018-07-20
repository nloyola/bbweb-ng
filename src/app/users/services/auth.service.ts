import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';

import { UsersModule } from '../users.module'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authToken: any;
  private user$ = new Subject<object>();

  constructor(private http: HttpClient) {
    this.authToken = JSON.parse(localStorage.getItem('authToken'));
    if (this.authToken) {
      this.user$.next(this.authToken.user);
    } else {
      this.user$.next(null);
    }
  }

  login(email: string, password: string) {
    return this.http.post<any>('/api/users/login', { email, password })
      .pipe(map((res: any) => {
        if (res && res.data && res.data.user && res.data.token) {
          this.authToken = res.data;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('authToken', JSON.stringify(this.authToken));
          this.user$.next(this.authToken.user);
        }
      }));
  }

  logout() {
    this.authToken = null;
    localStorage.removeItem('authToken');
    this.user$.next(null);
  }

  isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }

  getUserObservable() {
    return this.user$;
  }

  getUser() {
    if (this.authToken) {
      return this.authToken.user;
    }
    return null;
  }
}
