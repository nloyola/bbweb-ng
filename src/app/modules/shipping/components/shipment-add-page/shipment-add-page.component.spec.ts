import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentAddPageComponent } from './shipment-add-page.component';

describe('ShipmentAddPageComponent', () => {
  let component: ShipmentAddPageComponent;
  let fixture: ComponentFixture<ShipmentAddPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentAddPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
