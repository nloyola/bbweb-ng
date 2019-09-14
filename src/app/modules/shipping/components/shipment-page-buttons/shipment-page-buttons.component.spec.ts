import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentPageButtonsComponent } from './shipment-page-buttons.component';
import { Factory } from '@test/factory';
import { Shipment } from '@app/domain/shipments';

describe('ShipmentPageButtonsComponent', () => {
  let component: ShipmentPageButtonsComponent;
  let fixture: ComponentFixture<ShipmentPageButtonsComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentPageButtonsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(ShipmentPageButtonsComponent);
    component = fixture.componentInstance;
    component.shipment = shipment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
