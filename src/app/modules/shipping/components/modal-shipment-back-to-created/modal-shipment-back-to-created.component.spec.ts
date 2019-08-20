import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentBackToCreatedComponent } from './modal-shipment-back-to-created.component';

describe('ModalShipmentBackToCreatedComponent', () => {
  let component: ModalShipmentBackToCreatedComponent;
  let fixture: ComponentFixture<ModalShipmentBackToCreatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalShipmentBackToCreatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentBackToCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
