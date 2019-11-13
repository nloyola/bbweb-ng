import { Shipment } from '@app/domain/shipments';
import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';

export namespace ShipmentFixture {
  export function updateActivatedRoute(s: Shipment): void {
    TestBed.get(ActivatedRoute).snapshot = { data: { shipment: s } };
  }
}
