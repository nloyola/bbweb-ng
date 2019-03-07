import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputPasswordComponent } from './modal-input-password.component';

describe('ModalInputPasswordComponent', () => {
  let component: ModalInputPasswordComponent;
  let fixture: ComponentFixture<ModalInputPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
