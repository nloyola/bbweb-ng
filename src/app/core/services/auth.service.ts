import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { User } from '@app/domain/users/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = '/api/users';
  private authToken: any;

  constructor(private http: HttpClient) {
    this.authToken = JSON.parse(localStorage.getItem('authToken'));
  }

  login(email: string, password: string) {
    return this.http.post<any>(this.baseUrl + '/login', { email, password })
      .pipe(map((res: any) => {
        if (res && res.data && res.data.user && res.data.token) {
          this.authToken = res.data;

          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('authToken', JSON.stringify(this.authToken));
          return new User().deserialize(this.authToken.user);
        }
      }));
  }

  logout() {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }

  getUser() {
    if (this.authToken) {
      return new User().deserialize(this.authToken.user);
    }
    return null;
  }
}
