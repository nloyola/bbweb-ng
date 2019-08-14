import { Component, Input, OnInit } from '@angular/core';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-shipment-page-buttons',
  templateUrl: './shipment-page-buttons.component.html',
  styleUrls: ['./shipment-page-buttons.component.scss']
})
export class ShipmentPageButtonsComponent implements OnInit {
  @Input() shipment: Shipment;

  constructor() {}

  ngOnInit() {}
}
