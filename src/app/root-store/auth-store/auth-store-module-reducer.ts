import { Actions, ActionTypes } from './auth-store-module-actions';
import { initialState, State } from './auth-store-module-state';

export function authReducer(state = initialState, action: Actions): State {
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
