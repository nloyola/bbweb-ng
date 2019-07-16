import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentViewPageComponent } from './shipment-view-page.component';

describe('ShipmentViewPageComponent', () => {
  let component: ShipmentViewPageComponent;
  let fixture: ComponentFixture<ShipmentViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentViewPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
