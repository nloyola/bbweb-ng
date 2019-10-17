import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ModalInputUrlComponent } from './modal-input-url.component';
import { By } from '@angular/platform-browser';
import * as faker from 'faker';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';

describe('ModalInputUrlComponent', () => {
  let component: ModalInputUrlComponent;
  let fixture: ComponentFixture<ModalInputUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ModalInputUrlComponent, ModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputUrlComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.options = {};
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputUrlComponent, string> = {};

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
      context.getValidValue = () => faker.internet.url();
      context.inputElement = () => fixture.debugElement.query(By.css('input'));
      context.markInputAsTouched = () => {
        component.input.markAllAsTouched();
      };
      context.requiredText = 'A web site address is required';
      context.confirm = () => component.confirm();
      context.dismiss = () => component.dismiss();
    });

    ModalInputComponentBehaviour.sharedBehaviour(context);
  });
});
