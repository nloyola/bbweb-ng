import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input/modal-input.component';
import { ModalInputAnnotationComponent } from './modal-input-annotation.component';

xdescribe('ModalInputAnnotationComponent', () => {
  let component: ModalInputAnnotationComponent;
  let fixture: ComponentFixture<ModalInputAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        ModalInputComponent,
        ModalInputAnnotationComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputAnnotationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.options = {};
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
