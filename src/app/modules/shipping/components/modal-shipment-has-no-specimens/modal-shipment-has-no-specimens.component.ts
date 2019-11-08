import { Component, Input } from '@angular/core';
import { ShipmentStateTransision } from '@app/core/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-shipment-has-no-specimens',
  templateUrl: './modal-shipment-has-no-specimens.component.html',
  styleUrls: ['./modal-shipment-has-no-specimens.component.scss']
})
export class ModalShipmentHasNoSpecimensComponent {
  @Input() transition: ShipmentStateTransision.Packed | ShipmentStateTransision.SkipToSent;

  constructor(public modal: NgbActiveModal) {}

  transitionIsPacked() {
    return this.transition === ShipmentStateTransision.Packed;
  }

  transitionIsSkipToSent() {
    return this.transition === ShipmentStateTransision.SkipToSent;
  }
}
