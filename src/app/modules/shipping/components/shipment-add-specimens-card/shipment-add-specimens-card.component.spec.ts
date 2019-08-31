import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentAddSpecimensCardComponent } from './shipment-add-specimens-card.component';

describe('ShipmentAddSpecimensCardComponent', () => {
  let component: ShipmentAddSpecimensCardComponent;
  let fixture: ComponentFixture<ShipmentAddSpecimensCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentAddSpecimensCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentAddSpecimensCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
