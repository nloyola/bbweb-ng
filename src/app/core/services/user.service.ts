import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = '/api/users'

  constructor(private http: HttpClient) {
  }

  passwordReset(email) {
    return this.http.post<any>(this.baseUrl + '/passreset', { email });
  }
}
