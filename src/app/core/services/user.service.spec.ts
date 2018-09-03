import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User } from '@app/domain/users';

describe('UserService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [UserService]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  it('makes a password reset request',
    inject(
      [UserService],
      (
        service: UserService
      ) => {
        const email = 'test@test.com';
        const user = new User().deserialize({
          name: 'Random Person',
          email: email
        });

        service.passwordReset(email).subscribe(u => {
          expect(u.email).toBe(email);
        });

        const req = httpMock.expectOne(`${service.BASE_URL}/passreset`);
        expect(req.request.method).toBe('POST');
        req.flush(user);
      }));
});
