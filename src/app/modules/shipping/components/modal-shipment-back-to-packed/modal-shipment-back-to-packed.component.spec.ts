import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentBackToPackedComponent } from './modal-shipment-back-to-packed.component';

describe('ModalShipmentBackToPackedComponent', () => {
  let component: ModalShipmentBackToPackedComponent;
  let fixture: ComponentFixture<ModalShipmentBackToPackedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalShipmentBackToPackedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentBackToPackedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
