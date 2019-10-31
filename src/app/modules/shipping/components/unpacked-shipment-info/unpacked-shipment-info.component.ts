import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-unpacked-shipment-info',
  templateUrl: './unpacked-shipment-info.component.html',
  styleUrls: ['./unpacked-shipment-info.component.scss']
})
export class UnpackedShipmentInfoComponent implements OnInit {
  shipment: Shipment;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.shipment = this.route.parent.snapshot.data.shipment;
  }
}
