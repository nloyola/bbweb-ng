import { Component } from '@angular/core';
import { CentreShipmentsIncomingComponent } from '../centre-shipments-incoming/centre-shipments-incoming.component';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-centre-shipments-completed',
  templateUrl: './centre-shipments-completed.component.html',
  styleUrls: ['./centre-shipments-completed.component.scss']
})
export class CentreShipmentsCompletedComponent extends CentreShipmentsIncomingComponent {
  protected updateFilters(): string {
    return super.updateFilters() + ';state::completed';
  }

  shipmentRemoved(_shipment: Shipment) {
    throw Error('should never be called');
  }
}
