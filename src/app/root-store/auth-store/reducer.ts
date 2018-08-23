import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
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
      return state;
    }
    case ActionTypes.LOGOUT_FAILURE: {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case ActionTypes.LOGOUT_SUCCESS: {
      return {
        ...state,
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
