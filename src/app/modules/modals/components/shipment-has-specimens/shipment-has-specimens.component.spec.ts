import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentHasSpecimensComponent } from './shipment-has-specimens.component';

describe('ShipmentHasSpecimensComponent', () => {
  let component: ShipmentHasSpecimensComponent;
  let fixture: ComponentFixture<ShipmentHasSpecimensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentHasSpecimensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentHasSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
