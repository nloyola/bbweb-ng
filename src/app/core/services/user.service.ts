import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly BASE_URL = '/api/users'

  constructor(private http: HttpClient) {
  }

  passwordReset(email) {
    return this.http.post<any>(this.BASE_URL + '/passreset', { email });
  }
}
