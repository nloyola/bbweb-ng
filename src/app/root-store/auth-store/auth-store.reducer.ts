import * as AuthStoreActions from './auth-store.actions';
import { User } from '@app/domain/users';
import { AUTH_TOKEN_LOCAL_STORAGE_KEY } from '@app/core/services/auth.service';

export interface State {
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
  error: null,
  user: getLocalStorageUser(),
  registeredUser: null
};

export function reducer(state = initialState, action: AuthStoreActions.AuthStoreActionsUnion): State {
  switch (action.type) {
    case AuthStoreActions.loginRequestAction.type: {
      return {
        ...state,
        error: null,
        user: null
      };
    }
    case AuthStoreActions.loginFailureAction.type: {
      return {
        ...state,
        error: action.error
      };
    }
    case AuthStoreActions.loginClearFailureAction.type: {
      return {
        ...state,
        error: null
      };
    }
    case AuthStoreActions.loginSuccessAction.type: {
      return {
        ...state,
        error: null,
        user: action.user
      };
    }
    case AuthStoreActions.logoutRequestAction.type: {
      return {
        ...state,
        error: null,
        user: null
      };
    }
    case AuthStoreActions.logoutFailureAction.type: {
      return {
        ...state,
        error: action.error
      };
    }
    case AuthStoreActions.logoutSuccessAction.type: {
      return {
        ...state,
        error: null,
        user: null
      };
    }
    case AuthStoreActions.registerRequestAction.type: {
      return {
        ...state,
        error: null,
        registeredUser: null
      };
    }
    case AuthStoreActions.registerFailureAction.type: {
      return {
        ...state,
        error: action.error
      };
    }
    case AuthStoreActions.registerClearFailureAction.type: {
      return {
        ...state,
        error: null
      };
    }
    case AuthStoreActions.registerSuccessAction.type: {
      return {
        ...state,
        error: null,
        registeredUser: action.user
      };
    }
    default: {
      return state;
    }
  }
}
