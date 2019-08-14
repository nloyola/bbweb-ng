import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shipment-remove-modal',
  templateUrl: './shipment-remove-modal.component.html',
  styleUrls: ['./shipment-remove-modal.component.scss']
})
export class ShipmentRemoveModalComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  dismiss(): void {
    this.modal.dismiss();
  }

  confirm(): void {
    this.modal.close();
  }
}
