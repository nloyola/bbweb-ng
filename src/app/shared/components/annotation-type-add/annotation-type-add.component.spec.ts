import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnotationTypeAddComponent } from './annotation-type-add.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';

describe('AnnotationTypeAddComponent', () => {
  let component: AnnotationTypeAddComponent;
  let fixture: ComponentFixture<AnnotationTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [ AnnotationTypeAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationTypeAddComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
