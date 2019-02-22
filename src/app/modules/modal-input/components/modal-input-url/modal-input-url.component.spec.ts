import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputUrlComponent } from './modal-input-url.component';

describe('ModalInputUrlComponent', () => {
  let component: ModalInputUrlComponent;
  let fixture: ComponentFixture<ModalInputUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
