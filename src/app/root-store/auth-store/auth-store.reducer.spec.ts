import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { User } from '@app/domain/users';
import { Factory } from '@app/test/factory';

describe('auth-store-model reducer', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('LoginRequestAction', () => {
    const payload = {
      email: 'test@test.com',
      password: 'a random password'
    };
    const action = new AuthStoreActions.LoginRequestAction(payload);
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
    const action = new AuthStoreActions.LoginFailureAction(payload);
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
    const action = new AuthStoreActions.LoginClearFailureAction();
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
    const action = new AuthStoreActions.LoginSuccessAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      user: payload.user
    });
  });

  it('LogoutRequestAction', () => {
    const action = new AuthStoreActions.LogoutRequestAction();
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
    const action = new AuthStoreActions.LogoutFailureAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      error: payload.error
    });
  });

  it('LogoutSuccessAction', () => {
    const action = new AuthStoreActions.LogoutSuccessAction();
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
    const action = new AuthStoreActions.RegisterRequestAction(payload);
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
    const action = new AuthStoreActions.RegisterFailureAction(payload);
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
    const action = new AuthStoreActions.RegisterClearFailureAction();
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
    const action = new AuthStoreActions.RegisterSuccessAction(payload);
    const state = AuthStoreReducer.reducer(undefined, action);

    expect(state).toEqual({
      ...AuthStoreReducer.initialState,
      registeredUser: payload.user
    });
  });

});
