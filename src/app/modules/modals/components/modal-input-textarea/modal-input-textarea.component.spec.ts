import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputTextareaComponent } from './modal-input-textarea.component';
import { ModalInputComponent } from '../modal-input/modal-input.component';

describe('ModalInputTextareaComponent', () => {
  let component: ModalInputTextareaComponent;
  let fixture: ComponentFixture<ModalInputTextareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputTextareaComponent
      ]
    })
    .compileComponents();
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
});
