import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentViewCompletedComponent } from './shipment-view-completed.component';

describe('ShipmentViewCompletedComponent', () => {
  let component: ShipmentViewCompletedComponent;
  let fixture: ComponentFixture<ShipmentViewCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentViewCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
