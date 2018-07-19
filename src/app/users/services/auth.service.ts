import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';

import { UsersModule } from '../users.module'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: object;
  private user$ = new Subject<object>();

  constructor(private http: HttpClient) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user$.next(this.currentUser);
  }

  login(email: string, password: string) {
    return this.http.post<any>('/api/users/login', { email, password })
      .pipe(map((res: any) => {
        if (res && res.data && res.data.token) {
          this.currentUser = { email, token: res.data.token };
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.user$.next(this.currentUser);
        }
      }));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.user$.next(null);
  }

  isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
  }

  getUserObservable() {
    return this.user$;
  }

  getUser() {
    return this.currentUser;
  }
}
