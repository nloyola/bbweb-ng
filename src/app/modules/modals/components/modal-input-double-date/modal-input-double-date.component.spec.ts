import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputDoubleDateComponent } from './modal-input-double-date.component';

describe('ModalInputDoubleDateComponent', () => {
  let component: ModalInputDoubleDateComponent;
  let fixture: ComponentFixture<ModalInputDoubleDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputDoubleDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputDoubleDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
