import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User } from '@app/domain/users';
import { Factory } from '@app/test/factory';

describe('UserService', () => {

  const BASE_URL = '/api/users';

  let httpMock: HttpTestingController;
  let service: UserService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [UserService]
    });
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(UserService);
    factory = new Factory();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('makes a password reset request', () => {
    const user = new User().deserialize(factory.user());

    service.passwordReset(user.email).subscribe(u => {
      expect(u.email).toBe(user.email);
    });

    const req = httpMock.expectOne(`${BASE_URL}/passreset`);
    expect(req.request.method).toBe('POST');
    req.flush(user);
  });
});
