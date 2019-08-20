import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shipment-not-in-created-modal',
  templateUrl: './shipment-not-in-created-modal.component.html',
  styleUrls: ['./shipment-not-in-created-modal.component.scss']
})
export class ShipmentNotInCreatedModalComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
