import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputBooleanComponent } from './modal-input-boolean.component';
import { ModalInputComponent } from '../modal-input/modal-input.component';

describe('ModalInputBooleanComponent', () => {
  let component: ModalInputBooleanComponent;
  let fixture: ComponentFixture<ModalInputBooleanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputBooleanComponent
      ]
    })
    .compileComponents();
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
});
