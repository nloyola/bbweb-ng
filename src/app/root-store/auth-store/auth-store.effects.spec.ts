import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@app/core/services';
import { User } from '@app/domain/users';
import { AuthStoreActions } from '@app/root-store/auth-store';
import { Factory } from '@app/test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { AuthStoreEffects } from './auth-store.effects';

describe('auth-store effects', () => {

  let effects: AuthStoreEffects;
  let actions: Observable<any>;
  let authService: AuthService;
  let factory: Factory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthStoreEffects,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(AuthStoreEffects);
    authService = TestBed.get(AuthService);
    factory = new Factory();
  });

  describe('loginRequestEffect', () => {
    let user: User;
    let credentials: any;

    beforeEach(() => {
      user = new User().deserialize(factory.user());
      credentials = {
        email: user.email,
        password: 'a random password'
      };
    });

    it('should respond with login success', () => {
      const action = new AuthStoreActions.LoginRequestAction(credentials);
      const completion = new AuthStoreActions.LoginSuccessAction({ user });
      spyOn(authService, 'login').and.returnValue(of(user));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.loginRequest$).toBeObservable(expected);
    });

    it('should respond with login failure', () => {
      const error = {
        status: 401,
        error: {
          message: 'simulated error'
        }
      };
      const action = new AuthStoreActions.LoginRequestAction(credentials);
      const completion = new AuthStoreActions.LoginFailureAction({ error });
      spyOn(authService, 'login').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.loginRequest$).toBeObservable(expected);
    });

  });

  describe('logoutRequestEffect', () => {

    it('should respond with logout success', () => {
      const action = new AuthStoreActions.LogoutRequestAction();
      const completion = new AuthStoreActions.LogoutSuccessAction();
      spyOn(authService, 'logout').and.returnValue(null);

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.logoutRequest$).toBeObservable(expected);
      expect(authService.logout).toHaveBeenCalled();
    });

  });

  describe('registerRequestEffect', () => {

    let user: User;
    let regInfo: any;

    beforeEach(() => {
      user = new User().deserialize(factory.user());
      regInfo = {
        name: user.name,
        email: user.email,
        password: 'a random password'
      };
    });

    it('should respond with register success', () => {
      const action = new AuthStoreActions.RegisterRequestAction(regInfo);
      const completion = new AuthStoreActions.RegisterSuccessAction({ user });
      spyOn(authService, 'register').and.returnValue(of(user));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.registerRequest$).toBeObservable(expected);
    });

    it('should respond with register failure', () => {
      const error = {
        status: 401,
        error: {
          message: 'simulated error'
        }
      };
      const action = new AuthStoreActions.RegisterRequestAction(regInfo);
      const completion = new AuthStoreActions.RegisterFailureAction({ error });
      spyOn(authService, 'register').and.returnValue(throwError(error));

      actions = hot('--a-', { a: action });
      const expected = cold('--b', { b: completion });

      expect(effects.registerRequest$).toBeObservable(expected);
    });

  });

});
