import { AuthStoreActions } from '@app/root-store/auth-store';
import { User } from '@app/domain/users';
import { Factory } from '@test/factory';
import * as faker from 'faker';

describe('auth-store actions', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('LoginRequestAction', () => {
    const payload = {
      email: faker.internet.email(),
      password: 'a random password'
    };
    const action = new AuthStoreActions.LoginRequestAction(payload);
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGIN_REQUEST,
      payload
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
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGIN_FAILURE,
      payload
    });
  });

  it('LoginClearFailureAction', () => {
    const action = new AuthStoreActions.LoginClearFailureAction();
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGIN_CLEAR_FAILURE
    });
  });

  it('LoginSuccessAction', () => {
    const payload = {
      user: new User().deserialize(factory.user())
    };
    const action = new AuthStoreActions.LoginSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGIN_SUCCESS,
      payload
    });
  });

  it('LogoutRequestAction', () => {
    const action = new AuthStoreActions.LogoutRequestAction();
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGOUT_REQUEST
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
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGOUT_FAILURE,
      payload
    });
  });

  it('LogoutSuccessAction', () => {
    const action = new AuthStoreActions.LogoutSuccessAction();
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.LOGOUT_SUCCESS
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
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.REGISTER_REQUEST,
      payload
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
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.REGISTER_FAILURE,
      payload
    });
  });

  it('RegisterClearFailureAction', () => {
    const action = new AuthStoreActions.RegisterClearFailureAction();
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.REGISTER_CLEAR_FAILURE
    });
  });

  it('RegisterSuccessAction', () => {
    const payload = {
      user: new User().deserialize(factory.user())
    };
    const action = new AuthStoreActions.RegisterSuccessAction(payload);
    expect({ ...action }).toEqual({
      type: AuthStoreActions.ActionTypes.REGISTER_SUCCESS,
      payload
    });
  });

});
