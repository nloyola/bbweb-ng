import { AdminStudyModule } from './admin-study.module';

describe('AdminStudyModule', () => {
  let adminStudyModule: AdminStudyModule;

  beforeEach(() => {
    adminStudyModule = new AdminStudyModule();
  });

  it('should create an instance', () => {
    expect(adminStudyModule).toBeTruthy();
  });
});
