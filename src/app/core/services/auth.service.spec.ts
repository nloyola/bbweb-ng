import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '@app/domain/users';
import { Factory } from '@test/factory';
import { AuthService, AUTH_TOKEN_LOCAL_STORAGE_KEY } from './auth.service';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let service: AuthService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [AuthService]
    });
    httpMock = TestBed.get(HttpTestingController);

    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
    service = TestBed.get(AuthService);
    factory = new Factory();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('for a login request', () => {

    const password = 'fake password';
    let rawUser: any;

    beforeEach(() => {
      rawUser = factory.user();
    });

    it('reply is handled correctly', () => {
      const reply = {
        status: 'success',
        data: {
          token: 'fake token',
          user: rawUser
        }
      };

      service.login(rawUser.email, password).subscribe(u => {
        const user = new User().deserialize(rawUser);
        expect(u).toEqual(user);
      });

      const req = httpMock.expectOne(`${service.BASE_URL}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(reply);

      expect(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)).toBeTruthy();
    });

    it('handles an error  response from the server', () => {
      const reply = {
        status: 'success',
        data: {}
      };

      service.login(rawUser.email, password).subscribe(
        u => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected an auth token object'); }
      );

      const req = httpMock.expectOne(`${service.BASE_URL}/login`);
      req.flush(reply);
    });

  });

  it('logs out a user', () => {
    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
    service.logout();
    expect(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY)).toBeFalsy();
  });

  it('makes a registration request', () => {
    const password = 'fake password';
    const rawUser = factory.user();
    const reply = {
      status: 'success',
      data: rawUser
    };

    service.register(rawUser.name, rawUser.email, password).subscribe(u => {
      const user = new User().deserialize(rawUser);
      expect(u).toEqual(user);
    });

    const req = httpMock.expectOne(`${service.BASE_URL}/`);
    expect(req.request.method).toBe('POST');
    req.flush(reply);
  });

  describe('isLogged in works', () => {

    it('on initialization', () => {
      expect(service.isLoggedIn()).toBeFalsy();
    });

    it('after user logs in', () => {
      fakeLogin();
      expect(service.isLoggedIn()).toBeTruthy();
    });
  });

  describe('getUser works', () => {

    it('returns null if user has not logged in', () => {
      expect(service.getUser()).toEqual(null);
    });

    it('returns a valid user after login', () => {
      const user = fakeLogin();
      expect(service.getUser()).toEqual(user);
    });

    it('returns null after user logs out', () => {
      fakeLogin();
      service.logout();
      expect(service.getUser()).toEqual(null);
    });
  });

  function fakeLogin() {
    const tokenData = {
      token: 'fake token',
      user: factory.user()
    };

    localStorage.setItem('authToken', JSON.stringify(tokenData));
    return new User().deserialize(tokenData.user);
  }

});
