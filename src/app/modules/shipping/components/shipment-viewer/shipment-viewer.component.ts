import { Component, Input } from '@angular/core';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-shipment-viewer',
  templateUrl: './shipment-viewer.component.html',
  styleUrls: ['./shipment-viewer.component.scss']
})
export class ShipmentViewerComponent {
  @Input() shipment: Shipment;
  @Input() displayState: boolean;

  constructor() {}
}
