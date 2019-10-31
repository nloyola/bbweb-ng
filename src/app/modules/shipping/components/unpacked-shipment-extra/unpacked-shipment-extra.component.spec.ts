import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackedShipmentExtraComponent } from './unpacked-shipment-extra.component';

describe('UnpackedShipmentExtraComponent', () => {
  let component: UnpackedShipmentExtraComponent;
  let fixture: ComponentFixture<UnpackedShipmentExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnpackedShipmentExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpackedShipmentExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
