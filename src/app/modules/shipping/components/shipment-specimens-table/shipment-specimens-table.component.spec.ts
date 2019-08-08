import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentSpecimensTableComponent } from './shipment-specimens-table.component';

describe('ShipmentSpecimensTableComponent', () => {
  let component: ShipmentSpecimensTableComponent;
  let fixture: ComponentFixture<ShipmentSpecimensTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentSpecimensTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentSpecimensTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
