import { AuthStoreModule } from './auth-store.module';

describe('AuthStoreModule', () => {
  let authStoreModule: AuthStoreModule;

  beforeEach(() => {
    authStoreModule = new AuthStoreModule();
  });

  it('should create an instance', () => {
    expect(authStoreModule).toBeTruthy();
  });
});
