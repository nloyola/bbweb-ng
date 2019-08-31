import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentNotInCreatedModalComponent } from './shipment-not-in-created-modal.component';

describe('ShipmentNotInCreatedModalComponent', () => {
  let component: ShipmentNotInCreatedModalComponent;
  let fixture: ComponentFixture<ShipmentNotInCreatedModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentNotInCreatedModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentNotInCreatedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
