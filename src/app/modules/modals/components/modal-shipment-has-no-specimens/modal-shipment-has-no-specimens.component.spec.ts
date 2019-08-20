import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShipmentHasNoSpecimensComponent } from './modal-shipment-has-no-specimens.component';

describe('ModalShipmentHasNoSpecimensComponent', () => {
  let component: ModalShipmentHasNoSpecimensComponent;
  let fixture: ComponentFixture<ModalShipmentHasNoSpecimensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalShipmentHasNoSpecimensComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShipmentHasNoSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
