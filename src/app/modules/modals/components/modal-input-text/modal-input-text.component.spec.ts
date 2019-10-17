import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputTextComponent } from './modal-input-text.component';
import { ModalComponent } from '../modal/modal.component';
import { By } from '@angular/platform-browser';
import * as faker from 'faker';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';

describe('ModalInputTextComponent', () => {
  let component: ModalInputTextComponent;
  let fixture: ComponentFixture<ModalInputTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ModalComponent, ModalInputTextComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputTextComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.options = {};
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputTextComponent, string> = {};

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
      context.inputElement = () => fixture.debugElement.query(By.css('input'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'A value is required';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });
});
