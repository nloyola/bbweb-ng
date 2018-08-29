import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { AuthStoreActions, AuthStoreSelectors, AuthStoreState } from '@app/root-store/auth-store';

describe('auth-store-module selectors', () => {

  it('selectAuthIsLoggingIn', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        isLoggingIn: true
      }
    };

    expect(AuthStoreSelectors.selectAuthIsLoggingIn(state)).toBeTruthy();
  });

  it('selectAuthIsRegistering', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        isRegistering: true
      }
    };

    expect(AuthStoreSelectors.selectAuthIsRegistering(state)).toBeTruthy();
  });

  it('selectAuthError', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        error: {
          status: 404,
          error: {
            message: 'error'
          }
        }
      }
    };

    expect(AuthStoreSelectors.selectAuthError(state)).toBeTruthy();
  });

  it('selectUserLogoutError', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        error: {
          status: 404,
          error: {
            message: 'error'
          }
        }
      }
    };

    expect(AuthStoreSelectors.selectUserLogoutError(state)).toBeTruthy();
  });

  it('selectAuthUser', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        user: {
          name: 'Random user'
        }
      }
    };

    expect(AuthStoreSelectors.selectAuthUser(state)).toBeTruthy();
  });

  it('selectAuthRegisteredUser', () => {
    const state = {
      auth: {
        ...AuthStoreState.initialState,
        registeredUser: {
          name: 'Random user'
        }
      }
    };

    expect(AuthStoreSelectors.selectAuthRegisteredUser(state)).toBeTruthy();
  });

});
