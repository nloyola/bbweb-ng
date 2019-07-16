import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentInformationComponent } from './shipment-information.component';

describe('ShipmentInformationComponent', () => {
  let component: ShipmentInformationComponent;
  let fixture: ComponentFixture<ShipmentInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
