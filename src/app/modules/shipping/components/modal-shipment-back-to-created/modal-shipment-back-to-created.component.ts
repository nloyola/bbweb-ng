import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';

@Component({
  selector: 'app-modal-shipment-back-to-created',
  templateUrl: './modal-shipment-back-to-created.component.html',
  styleUrls: ['./modal-shipment-back-to-created.component.scss']
})
export class ModalShipmentBackToCreatedComponent extends ModalComponent implements OnInit {
  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}
}
