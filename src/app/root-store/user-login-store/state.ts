import { User } from '@app/domain/users/user.model';

export interface State {
  isLoading?: boolean;
  isLoaded?: boolean;
  error?: any;
  user?: User;
}

// FIXME: this is a hacky way of determining the initial state
function getLocalStorageUser() {
  const authToken = JSON.parse(localStorage.getItem('authToken'));
  if (authToken === null) {
    return null;
  }
  return authToken.user;
}

export const initialState: State = {
  isLoading: false,
  isLoaded: false,
  error: null,
  user: getLocalStorageUser()
};
