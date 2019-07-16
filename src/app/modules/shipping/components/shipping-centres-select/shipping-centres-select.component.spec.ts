import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingCentresSelectComponent } from './shipping-centres-select.component';

describe('ShippingCentresSelectComponent', () => {
  let component: ShippingCentresSelectComponent;
  let fixture: ComponentFixture<ShippingCentresSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShippingCentresSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingCentresSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
