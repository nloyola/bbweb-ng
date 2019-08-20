import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-shipment-page-buttons',
  templateUrl: './shipment-page-buttons.component.html',
  styleUrls: ['./shipment-page-buttons.component.scss']
})
export class ShipmentPageButtonsComponent implements OnInit {
  @Input() shipment: Shipment;

  @Output() backEvent = new EventEmitter<void>();
  @Output() forwardEvent = new EventEmitter<void>();
  @Output() fastForwardEvent = new EventEmitter<void>();
  @Output() fastForwardToLostEvent = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  back() {
    this.backEvent.emit();
  }

  forward() {
    this.forwardEvent.emit();
  }

  fastForward() {
    this.fastForwardEvent.emit();
  }

  fastForwardToLost() {
    this.fastForwardToLostEvent.emit();
  }
}
