import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { ModalInputUrlComponent } from './modal-input-url.component';

describe('ModalInputUrlComponent', () => {
  let component: ModalInputUrlComponent;
  let fixture: ComponentFixture<ModalInputUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputUrlComponent,
        ModalInputComponent
      ]
    })
    .compileComponents();
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
});
