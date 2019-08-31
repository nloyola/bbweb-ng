import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputCentreLocationComponent } from './modal-input-centre-location.component';

describe('ModalInputCentreLocationComponent', () => {
  let component: ModalInputCentreLocationComponent;
  let fixture: ComponentFixture<ModalInputCentreLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalInputCentreLocationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputCentreLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
