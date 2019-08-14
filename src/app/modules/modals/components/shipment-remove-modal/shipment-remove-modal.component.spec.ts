import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRemoveModalComponent } from './shipment-remove-modal.component';

describe('ShipmentRemoveModalComponent', () => {
  let component: ShipmentRemoveModalComponent;
  let fixture: ComponentFixture<ShipmentRemoveModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentRemoveModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentRemoveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
