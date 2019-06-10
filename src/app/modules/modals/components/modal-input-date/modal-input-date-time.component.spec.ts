import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { ModalInputDateTimeComponent } from './modal-input-date-time.component';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ModalInputDateTimeComponent', () => {
  let component: ModalInputDateTimeComponent;
  let fixture: ComponentFixture<ModalInputDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputDateTimeComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
