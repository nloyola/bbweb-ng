import { User } from '@app/domain/users';

export interface AuthInfo {

  user: User;

  token: string;

  expiresOn: Date

}
