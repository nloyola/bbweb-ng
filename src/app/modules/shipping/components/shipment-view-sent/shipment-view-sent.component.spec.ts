import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentViewSentComponent } from './shipment-view-sent.component';

describe('ShipmentViewSentComponent', () => {
  let component: ShipmentViewSentComponent;
  let fixture: ComponentFixture<ShipmentViewSentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentViewSentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentViewSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
