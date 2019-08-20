import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-has-specimens',
  templateUrl: './modal-shipment-has-specimens.component.html',
  styleUrls: ['./modal-shipment-has-specimens.component.scss']
})
export class ModalShipmentHasSpecimensComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
