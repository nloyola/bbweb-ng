import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackedShipmentMissingComponent } from './unpacked-shipment-missing.component';

describe('UnpackedShipmentMissingComponent', () => {
  let component: UnpackedShipmentMissingComponent;
  let fixture: ComponentFixture<UnpackedShipmentMissingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnpackedShipmentMissingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpackedShipmentMissingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
