import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ModalInputPasswordComponent } from './modal-input-password.component';
import { By } from '@angular/platform-browser';
import * as faker from 'faker';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';

describe('ModalInputPasswordComponent', () => {
  let component: ModalInputPasswordComponent;
  let fixture: ComponentFixture<ModalInputPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ModalComponent, ModalInputPasswordComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputPasswordComponent, any> = {};

    beforeEach(() => {
      context.fixture = fixture;
      context.assignOptions = options => {
        component.options = options;
      };
      context.assignMockModal = mockModal => {
        component.modal = mockModal;
      };
      context.assignInputValue = value => {
        component.input.setValue(value.currentPassword);
      };
      context.getValidValue = () => ({ currentPassword: faker.lorem.words(3), newPassword: '' });
      context.inputElement = () => fixture.debugElement.query(By.css('input'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'Your current password is required';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });
});
