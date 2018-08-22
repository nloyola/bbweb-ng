import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  passwordReset(email) {
    return this.http.post<any>('/api/users/passreset', { email });
  }
}
