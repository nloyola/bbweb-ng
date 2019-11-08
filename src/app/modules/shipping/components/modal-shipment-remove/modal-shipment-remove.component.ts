import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-remove',
  templateUrl: './modal-shipment-remove.component.html',
  styleUrls: ['./modal-shipment-remove.component.scss']
})
export class ModalShipmentRemoveComponent {
  constructor(public modal: NgbActiveModal) {}
}
