import { AuthStoreModule } from './auth-store.module';

describe('AuthStoreModule', () => {
  let userLoginStoreModule: AuthStoreModule;

  beforeEach(() => {
    userLoginStoreModule = new AuthStoreModule();
  });

  it('should create an instance', () => {
    expect(userLoginStoreModule).toBeTruthy();
  });
});
