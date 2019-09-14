import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalShipmentHasSpecimensComponent } from './modal-shipment-has-specimens.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('ModalShipmentHasSpecimensComponent', () => {
  let component: ModalShipmentHasSpecimensComponent;
  let fixture: ComponentFixture<ModalShipmentHasSpecimensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, ReactiveFormsModule],
      providers: [NgbActiveModal],
      declarations: [ModalShipmentHasSpecimensComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
