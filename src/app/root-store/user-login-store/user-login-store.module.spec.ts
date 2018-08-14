import { UserLoginStoreModule } from './user-login-store.module';

describe('UserLoginStoreModule', () => {
  let userLoginStoreModule: UserLoginStoreModule;

  beforeEach(() => {
    userLoginStoreModule = new UserLoginStoreModule();
  });

  it('should create an instance', () => {
    expect(userLoginStoreModule).toBeTruthy();
  });
});
