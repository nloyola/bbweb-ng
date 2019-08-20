import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-back-to-packed',
  templateUrl: './modal-shipment-back-to-packed.component.html',
  styleUrls: ['./modal-shipment-back-to-packed.component.scss']
})
export class ModalShipmentBackToPackedComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  dismiss(): void {
    this.modal.dismiss();
  }

  confirm(): void {
    this.modal.close();
  }
}
