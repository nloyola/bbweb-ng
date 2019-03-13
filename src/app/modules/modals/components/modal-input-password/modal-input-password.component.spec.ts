import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { ModalInputPasswordComponent } from './modal-input-password.component';

describe('ModalInputPasswordComponent', () => {
  let component: ModalInputPasswordComponent;
  let fixture: ComponentFixture<ModalInputPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputPasswordComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
