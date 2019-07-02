import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { User } from '@app/domain/users';
import { Factory } from '@test/factory';

describe('auth-store-model reducer', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;
      const result = AuthStoreReducer.reducer(AuthStoreReducer.initialState, action);
      expect(result).toBe(AuthStoreReducer.initialState);
    });
  });

  it('LoginRequestAction', () => {
    const payload = {
      email: 'test@test.com',
      password: 'a random password'
    };
    const action = AuthStoreActions.loginRequestAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState
    });
  });

  it('LoginFailureAction', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = AuthStoreActions.loginFailureAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: payload.error
    });
  });

  it('LoginClearFailureAction', () => {
    const startState = {
      ...AuthStoreReducer.initialState,
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = AuthStoreActions.loginClearFailureAction();
    const state = AuthStoreReducer.reducer(startState, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: null
    });
  });

  it('LoginSuccessAction', () => {
    const payload = {
      user: new User().deserialize(factory.user())
    };
    const action = AuthStoreActions.loginSuccessAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      user: payload.user
    });
  });

  it('LogoutRequestAction', () => {
    const action = AuthStoreActions.logoutRequestAction();
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState
    });
  });

  it('LogoutFailureAction', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = AuthStoreActions.logoutFailureAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: payload.error
    });
  });

  it('LogoutSuccessAction', () => {
    const action = AuthStoreActions.logoutSuccessAction();
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      user: null
    });
  });

  it('RegisterRequestAction', () => {
    const rawUser = factory.user();
    const payload = {
      name: rawUser.name,
      email: rawUser.email,
      password: 'a random password'
    };
    const action = AuthStoreActions.registerRequestAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState
    });
  });

  it('RegisterFailureAction', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = AuthStoreActions.registerFailureAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: payload.error
    });
  });

  it('RegisterClearFailureAction', () => {
    const startState = {
      ...AuthStoreReducer.initialState,
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = AuthStoreActions.registerClearFailureAction();
    const state = AuthStoreReducer.reducer(startState, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: null
    });
  });

  it('RegisterSuccessAction', () => {
    const payload = {
      user: new User().deserialize(factory.user())
    };
    const action = AuthStoreActions.registerSuccessAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      registeredUser: payload.user
    });
  });

});
