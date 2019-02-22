import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputEmailComponent } from './modal-input-email.component';

describe('ModalInputEmailComponent', () => {
  let component: ModalInputEmailComponent;
  let fixture: ComponentFixture<ModalInputEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInputEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
