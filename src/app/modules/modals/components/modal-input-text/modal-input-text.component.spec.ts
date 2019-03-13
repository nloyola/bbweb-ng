import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputTextComponent } from './modal-input-text.component';
import { ModalInputComponent } from '../modal-input/modal-input.component';

describe('ModalInputTextComponent', () => {
  let component: ModalInputTextComponent;
  let fixture: ComponentFixture<ModalInputTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputTextComponent
      ]
    })
    .compileComponents();
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
});
