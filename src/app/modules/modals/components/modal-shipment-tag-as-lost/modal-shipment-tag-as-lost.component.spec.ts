import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentTagAsLostComponent } from './modal-shipment-tag-as-lost.component';

describe('ModalShipmentTagAsLostComponent', () => {
  let component: ModalShipmentTagAsLostComponent;
  let fixture: ComponentFixture<ModalShipmentTagAsLostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalShipmentTagAsLostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentTagAsLostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
