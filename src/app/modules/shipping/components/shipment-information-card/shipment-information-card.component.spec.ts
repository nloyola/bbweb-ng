import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentInformationCardComponent } from './shipment-information-card.component';

describe('ShipmentInformationCardComponent', () => {
  let component: ShipmentInformationCardComponent;
  let fixture: ComponentFixture<ShipmentInformationCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentInformationCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentInformationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
