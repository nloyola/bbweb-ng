import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';

@Component({
  selector: 'app-modal-shipment-back-to-packed',
  templateUrl: './modal-shipment-back-to-packed.component.html',
  styleUrls: ['./modal-shipment-back-to-packed.component.scss']
})
export class ModalShipmentBackToPackedComponent extends ModalComponent implements OnInit {
  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}
}