import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-back-to-created',
  templateUrl: './modal-shipment-back-to-created.component.html',
  styleUrls: ['./modal-shipment-back-to-created.component.scss']
})
export class ModalShipmentBackToCreatedComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  dismiss(): void {
    this.modal.dismiss();
  }

  confirm(): void {
    this.modal.close();
  }
}
