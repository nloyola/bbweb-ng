import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpackedShipmentInfoComponent } from './unpacked-shipment-info.component';

describe('UnpackedShipmentInfoComponent', () => {
  let component: UnpackedShipmentInfoComponent;
  let fixture: ComponentFixture<UnpackedShipmentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnpackedShipmentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpackedShipmentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
