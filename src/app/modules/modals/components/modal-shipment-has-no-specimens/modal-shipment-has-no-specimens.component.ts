import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-has-no-specimens',
  templateUrl: './modal-shipment-has-no-specimens.component.html',
  styleUrls: ['./modal-shipment-has-no-specimens.component.scss']
})
export class ModalShipmentHasNoSpecimensComponent implements OnInit {
  constructor(private modal: NgbActiveModal) {}

  ngOnInit() {}

  confirm(): void {
    this.modal.close();
  }
}
