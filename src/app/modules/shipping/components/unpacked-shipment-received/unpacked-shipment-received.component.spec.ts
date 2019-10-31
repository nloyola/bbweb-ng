import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackedShipmentReceivedComponent } from './unpacked-shipment-received.component';

describe('UnpackedShipmentReceivedComponent', () => {
  let component: UnpackedShipmentReceivedComponent;
  let fixture: ComponentFixture<UnpackedShipmentReceivedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnpackedShipmentReceivedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpackedShipmentReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
