import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentRemoveComponent } from './shipment-remove-modal.component';

describe('ModalShipmentRemoveComponent', () => {
  let component: ModalShipmentRemoveComponent;
  let fixture: ComponentFixture<ModalShipmentRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalShipmentRemoveComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
