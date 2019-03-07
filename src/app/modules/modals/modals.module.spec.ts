import { ModalInputModule } from './modal-input.module';

describe('ModalInputModule', () => {
  let modalInputModule: ModalInputModule;

  beforeEach(() => {
    modalInputModule = new ModalInputModule();
  });

  it('should create an instance', () => {
    expect(modalInputModule).toBeTruthy();
  });
});
