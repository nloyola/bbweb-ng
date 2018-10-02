import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputTextareaComponent } from './modal-input-textarea.component';

describe('ModalInputTextareaComponent', () => {
  let component: ModalInputTextareaComponent;
  let fixture: ComponentFixture<ModalInputTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputTextareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
