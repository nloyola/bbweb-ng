import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';

@Component({
  selector: 'app-modal-shipment-tag-as-lost',
  templateUrl: './modal-shipment-tag-as-lost.component.html',
  styleUrls: ['./modal-shipment-tag-as-lost.component.scss']
})
export class ModalShipmentTagAsLostComponent extends ModalComponent implements OnInit {
  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}
}
