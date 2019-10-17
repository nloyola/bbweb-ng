import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';
import * as faker from 'faker';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ModalComponent } from '../modal/modal.component';
import { ModalInputDateTimeComponent } from './modal-input-date-time.component';

describe('ModalInputDateTimeComponent', () => {
  let component: ModalInputDateTimeComponent;
  let fixture: ComponentFixture<ModalInputDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, OwlDateTimeModule, OwlNativeDateTimeModule],
      declarations: [ModalComponent, ModalInputDateTimeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputDateTimeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputDateTimeComponent, Date> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.assignOptions = options => {
        component.options = options;
      };
      context.assignMockModal = mockModal => {
        component.modal = mockModal;
      };
      context.assignInputValue = value => {
        component.input.setValue(value);
      };
      context.getValidValue = () => faker.date.recent(10);
      context.inputElement = () => fixture.debugElement.query(By.css('input'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'Please enter a date and time';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });
});
