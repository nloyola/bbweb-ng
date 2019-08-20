import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';

@Component({
  selector: 'app-modal-shipment-remove',
  templateUrl: './modal-shipment-remove.component.html',
  styleUrls: ['./modal-shipment-remove.component.scss']
})
export class ModalShipmentRemoveComponent extends ModalComponent implements OnInit {
  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}
}
