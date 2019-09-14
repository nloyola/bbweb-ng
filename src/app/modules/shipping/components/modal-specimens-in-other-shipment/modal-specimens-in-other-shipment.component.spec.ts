import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalSpecimensInOtherShipmentComponent } from './modal-specimens-in-other-shipment.component';

describe('ModalSpecimensInOtherShipmentComponent', () => {
  let component: ModalSpecimensInOtherShipmentComponent;
  let fixture: ComponentFixture<ModalSpecimensInOtherShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [ModalSpecimensInOtherShipmentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpecimensInOtherShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
