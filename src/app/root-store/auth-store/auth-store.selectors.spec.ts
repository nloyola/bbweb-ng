import { AuthStoreReducer, AuthStoreSelectors } from '@app/root-store/auth-store';
import { Factory } from '@test/factory';

describe('auth-store selectors', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('selectAuthError', () => {
    const state = {
      auth: {
        ...AuthStoreReducer.initialState,
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
        ...AuthStoreReducer.initialState,
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
        ...AuthStoreReducer.initialState,
        user: factory.user()
      }
    };

    expect(AuthStoreSelectors.selectAuthUser(state)).toBeTruthy();
  });

  it('selectAuthRegisteredUser', () => {
    const state = {
      auth: {
        ...AuthStoreReducer.initialState,
        registeredUser: factory.user()
      }
    };

    expect(AuthStoreSelectors.selectAuthRegisteredUser(state)).toBeTruthy();
  });

});
