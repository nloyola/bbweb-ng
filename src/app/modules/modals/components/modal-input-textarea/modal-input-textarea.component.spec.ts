import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputTextareaComponent } from './modal-input-textarea.component';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { By } from '@angular/platform-browser';
import * as faker from 'faker';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';

describe('ModalInputTextareaComponent', () => {
  let component: ModalInputTextareaComponent;
  let fixture: ComponentFixture<ModalInputTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ModalInputComponent, ModalInputTextareaComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputTextareaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.options = {};
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputTextareaComponent, string> = {};

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
      context.getValidValue = () => faker.lorem.words(3);
      context.inputElement = () => fixture.debugElement.query(By.css('textarea'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'Some text is required';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });
});
