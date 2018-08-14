import { User } from '@app/domain/users/user.model';

export interface State {
  isLoading?: boolean;
  isLoaded?: boolean;
  error?: any;
  user?: User;
}

export const initialState: State = {
  isLoading: false,
  isLoaded: false,
  error: null,
  user: null
};
