import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputTextComponent } from './modal-input-text.component';

describe('ModalInputTextComponent', () => {
  let component: ModalInputTextComponent;
  let fixture: ComponentFixture<ModalInputTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
