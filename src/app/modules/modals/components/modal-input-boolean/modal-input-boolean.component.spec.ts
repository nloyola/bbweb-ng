import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputComponentBehaviour } from '@test/behaviours/modal-input-component.behaviour';
import { ModalComponent } from '../modal/modal.component';
import { ModalInputBooleanComponent } from './modal-input-boolean.component';

describe('ModalInputBooleanComponent', () => {
  let component: ModalInputBooleanComponent;
  let fixture: ComponentFixture<ModalInputBooleanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ModalComponent, ModalInputBooleanComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputBooleanComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.options = {};
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('shared behaviour', () => {
    const context: ModalInputComponentBehaviour.Context<ModalInputBooleanComponent, boolean> = {};

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
      context.getValidValue = () => false;
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
