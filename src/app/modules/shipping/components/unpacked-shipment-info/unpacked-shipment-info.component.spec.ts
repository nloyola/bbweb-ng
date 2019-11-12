import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UnpackedShipmentInfoComponent } from './unpacked-shipment-info.component';
import { Shipment } from '@app/domain/shipments';
import { Factory } from '@test/factory';
import { ActivatedRoute } from '@angular/router';

describe('UnpackedShipmentInfoComponent', () => {
  let component: UnpackedShipmentInfoComponent;
  let fixture: ComponentFixture<UnpackedShipmentInfoComponent>;
  const factory = new Factory();
  let shipment: Shipment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        }
      ],
      declarations: [UnpackedShipmentInfoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    shipment = new Shipment().deserialize(factory.shipment());
    fixture = TestBed.createComponent(UnpackedShipmentInfoComponent);
    component = fixture.componentInstance;
    updateActivatedRoute(shipment);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  function updateActivatedRoute(s: Shipment): void {
    TestBed.get(ActivatedRoute).parent = { snapshot: { data: { shipment: s } } };
  }
});
