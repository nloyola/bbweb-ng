import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-tag-as-lost',
  templateUrl: './modal-shipment-tag-as-lost.component.html',
  styleUrls: ['./modal-shipment-tag-as-lost.component.scss']
})
export class ModalShipmentTagAsLostComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  dismiss(): void {
    this.modal.dismiss();
  }

  confirm(): void {
    this.modal.close();
  }
}
