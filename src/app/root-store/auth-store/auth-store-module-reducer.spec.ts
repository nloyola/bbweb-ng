import { authReducer } from './auth-store-module-reducer';
import { AuthStoreActions, AuthStoreState } from '@app/root-store/auth-store';
import { User } from '@app/domain/users';

describe('auth-store-model reducer', () => {

  it('LoginRequestAction', () => {
    const payload = {
      email: 'test@test.com',
      password: 'a random password'
    };
    const action = new AuthStoreActions.LoginRequestAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingIn: true
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
    const action = new AuthStoreActions.LoginFailureAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingIn: false,
      error: payload.error
    });
  });

  it('LoginClearFailureAction', () => {
    const startState = {
      ...AuthStoreState.initialState,
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new AuthStoreActions.LoginClearFailureAction();
    const state = authReducer(startState, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      error: null
    });
  });

  it('LoginSuccessAction', () => {
    const payload = {
      user: new User().deserialize({
        name: 'Random person',
        email: 'test@test.com',
      })
    };
    const action = new AuthStoreActions.LoginSuccessAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingIn: false,
      user: payload.user
    });
  });

  it('LogoutRequestAction', () => {
    const action = new AuthStoreActions.LogoutRequestAction();
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingOut: true
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
    const action = new AuthStoreActions.LogoutFailureAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingOut: false,
      error: payload.error
    });
  });

  it('LogoutSuccessAction', () => {
    const action = new AuthStoreActions.LogoutSuccessAction();
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isLoggingOut: false,
      user: null
    });
  });

  it('RegisterRequestAction', () => {
    const payload = {
      name: 'Random person',
      email: 'test@test.com',
      password: 'a random password'
    };
    const action = new AuthStoreActions.RegisterRequestAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isRegistering: true
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
    const action = new AuthStoreActions.RegisterFailureAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isRegistering: false,
      error: payload.error
    });
  });

  it('RegisterClearFailureAction', () => {
    const startState = {
      ...AuthStoreState.initialState,
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new AuthStoreActions.RegisterClearFailureAction();
    const state = authReducer(startState, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      error: null
    });
  });

  it('RegisterSuccessAction', () => {
    const payload = {
      user: new User().deserialize({
        name: 'Random person',
        email: 'test@test.com'
      })
    };
    const action = new AuthStoreActions.RegisterSuccessAction(payload);
    const state = authReducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreState.initialState,
      isRegistering: false,
      registeredUser: payload.user
    });
  });

});
