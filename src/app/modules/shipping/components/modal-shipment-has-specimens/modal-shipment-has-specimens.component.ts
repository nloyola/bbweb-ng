import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';

@Component({
  selector: 'app-modal-shipment-has-specimens',
  templateUrl: './modal-shipment-has-specimens.component.html',
  styleUrls: ['./modal-shipment-has-specimens.component.scss']
})
export class ModalShipmentHasSpecimensComponent extends ModalComponent implements OnInit {
  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}
}
