import { Actions, ActionTypes } from './auth-store.actions';
import { User } from '@app/domain/users';
import { AUTH_TOKEN_LOCAL_STORAGE_KEY } from '@app/core/services/auth.service';

export interface State {
  isLoggingIn?: boolean;
  isLoggingOut?: boolean;
  isRegistering?: boolean;
  error?: any;
  user?: User;
  registeredUser?: User;
}

// FIXME: this is a hacky way of determining the initial state
function getLocalStorageUser() {
  const authToken = JSON.parse(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY));
  if (authToken === null) {
    return null;
  }
  return new User().deserialize(authToken.user);
}

export const initialState: State = {
  isLoggingIn: false,
  isLoggingOut: false,
  isRegistering: false,
  error: null,
  user: getLocalStorageUser(),
  registeredUser: null
};

export function reducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOGIN_REQUEST: {
      return {
        ...state,
        isLoggingIn: true,
        error: null,
        user: null
      };
    }
    case ActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        isLoggingIn: false,
        error: action.payload.error
      };
    }
    case ActionTypes.LOGIN_CLEAR_FAILURE: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        isLoggingIn: false,
        error: null,
        user: action.payload.user
      };
    }
    case ActionTypes.LOGOUT_REQUEST: {
      return {
        ...state,
        isLoggingOut: true,
        error: null,
        user: null
      };
    }
    case ActionTypes.LOGOUT_FAILURE: {
      return {
        ...state,
        isLoggingOut: false,
        error: action.payload.error
      };
    }
    case ActionTypes.LOGOUT_SUCCESS: {
      return {
        ...state,
        isLoggingOut: false,
        error: null,
        user: null
      };
    }
    case ActionTypes.REGISTER_REQUEST: {
      return {
        ...state,
        isRegistering: true,
        error: null,
        registeredUser: null
      };
    }
    case ActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        isRegistering: false,
        error: action.payload.error
      };
    }
    case ActionTypes.REGISTER_CLEAR_FAILURE: {
      return {
        ...state,
        error: null
      };
    }
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        isRegistering: false,
        error: null,
        registeredUser: action.payload.user
      };
    }
    default: {
      return state;
    }
  }
}
