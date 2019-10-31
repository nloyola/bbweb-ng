import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackedShipmentUnpackComponent } from './unpacked-shipment-unpack.component';

describe('UnpackedShipmentUnpackComponent', () => {
  let component: UnpackedShipmentUnpackComponent;
  let fixture: ComponentFixture<UnpackedShipmentUnpackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnpackedShipmentUnpackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpackedShipmentUnpackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
