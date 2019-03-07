import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-yes-no',
  templateUrl: './modal-yes-no.component.html',
  styleUrls: ['./modal-yes-no.component.scss']
})
export class ModalYesNoComponent {

  @Input() modal: NgbActiveModal;

  constructor() { }

  confirm(): void {
    this.modal.close();
  }

  dismiss(): void {
    this.modal.dismiss();
  }

}
