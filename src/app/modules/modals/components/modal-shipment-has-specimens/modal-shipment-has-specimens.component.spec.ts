import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentHasSpecimensComponent } from './modal-shipment-has-specimens.component';

describe('ModalShipmentHasSpecimensComponent', () => {
  let component: ModalShipmentHasSpecimensComponent;
  let fixture: ComponentFixture<ModalShipmentHasSpecimensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalShipmentHasSpecimensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentHasSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
