import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSpecimensExistInAnotherShipmentComponent } from './modal-specimens-exist-in-another-shipment.component';

describe('ModalSpecimensExistInAnotherShipmentComponent', () => {
  let component: ModalSpecimensExistInAnotherShipmentComponent;
  let fixture: ComponentFixture<ModalSpecimensExistInAnotherShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSpecimensExistInAnotherShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpecimensExistInAnotherShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
