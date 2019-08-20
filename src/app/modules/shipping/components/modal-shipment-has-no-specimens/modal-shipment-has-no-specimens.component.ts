import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@app/modules/modals/components/modal.component';
import { ShipmentStateTransision } from '@app/core/services';

@Component({
  selector: 'app-modal-shipment-has-no-specimens',
  templateUrl: './modal-shipment-has-no-specimens.component.html',
  styleUrls: ['./modal-shipment-has-no-specimens.component.scss']
})
export class ModalShipmentHasNoSpecimensComponent extends ModalComponent implements OnInit {
  @Input() transition: ShipmentStateTransision.Packed | ShipmentStateTransision.SkipToSent;

  constructor(modal: NgbActiveModal) {
    super(modal);
  }

  ngOnInit() {}

  transitionIsPacked() {
    return this.transition === ShipmentStateTransision.Packed;
  }

  transitionIsSkipToSent() {
    return this.transition === ShipmentStateTransision.SkipToSent;
  }
}
