import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * A base class for Modal components.
 */
export class ModalComponent {
  constructor(protected modal: NgbActiveModal) {}

  dismiss(): void {
    this.modal.dismiss();
  }

  confirm(): void {
    this.modal.close();
  }
}