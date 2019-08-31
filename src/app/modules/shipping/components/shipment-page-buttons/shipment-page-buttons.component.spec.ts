import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentPageButtonsComponent } from './shipment-page-buttons.component';

describe('ShipmentPageButtonsComponent', () => {
  let component: ShipmentPageButtonsComponent;
  let fixture: ComponentFixture<ShipmentPageButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentPageButtonsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentPageButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
