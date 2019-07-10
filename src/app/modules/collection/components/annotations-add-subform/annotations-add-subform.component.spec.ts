import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Annotation, AnnotationFactory, AnnotationType, ValueTypes } from '@app/domain/annotations';
import { AnnotationSpecCommon } from '@test/annotation-spec-common';
import { Factory } from '@test/factory';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { Subject } from 'rxjs';
import { AnnotationsAddSubformComponent } from './annotations-add-subform.component';
import * as faker from 'faker';
import { ValueTransformer } from '@angular/compiler/src/util';

describe('AnnotationsAddSubformComponent', () => {

  @Component({
    template: `<form [formGroup]="form">
                 <app-annotations-add-subform [annotationsGroup]="annotationsGroup">
                 </app-annotations-add-subform>
               </form>`
  })
  class TestComponent implements OnInit, OnDestroy {

    form: FormGroup;
    annotationsGroup: FormGroup;
    annotations: Annotation[];
    unsubscribe$ = new Subject<void>();

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {
      this.annotationsGroup = this.formBuilder.group({
          annotations: AnnotationsAddSubformComponent.buildSubForm(this.annotations, this.unsubscribe$)
        })
      this.form = this.formBuilder.group({ annotationsGroup: this.annotationsGroup });
    }

    ngOnDestroy() {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule
      ],
      declarations: [
        TestComponent,
        AnnotationsAddSubformComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const { annotation } = createAnnotation();
    component.annotations = [ annotation ];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('works for each annotation type', () => {
    const annotations = Object.values(ValueTypes).map(valueType => {
      const annotationType = new AnnotationType().deserialize(factory.annotationType({
        valueType,
        required: true
      }));
      return AnnotationFactory.annotationFromType(annotationType);
    });

    const annotationType = new AnnotationType().deserialize(factory.multipleSelectAnnotationType());
    annotations.push(AnnotationFactory.annotationFromType(annotationType));

    component.annotations = annotations;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('valueToAnnotations', () => {

    it('works for non select annotations', () => {
      const valueTypes = [ ValueTypes.Text, ValueTypes.Number, ValueTypes.DateTime ];
      valueTypes.forEach(valueType => {
        const annotationType = new AnnotationType().deserialize(factory.annotationType({ valueType }));
        const { annotation } = createAnnotation({ annotationType });

        component.annotations = [ annotation ];
        fixture.detectChanges();

        const updatedAnnotations =
          AnnotationsAddSubformComponent.valueToAnnotations(component.annotationsGroup);
        expect(updatedAnnotations.length).toBe(1);
      });
    });

    describe('for select annotations', () => {

      it('is valid for single select', () => {
        const annotationType = new AnnotationType().deserialize(factory.singleSelectAnnotationType());
        const { annotation } = createAnnotation({ annotationType });

        component.annotations = [ annotation ];
        fixture.detectChanges();

        const selectOptionsElements = fixture.debugElement.queryAll(By.css('option'));
        expect(selectOptionsElements.length).toBe(annotationType.options.length + 1);
        selectOptionsElements[0].parent.nativeElement.value = annotationType.options[0];
        selectOptionsElements[0].parent.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        const updatedAnnotations = AnnotationsAddSubformComponent.valueToAnnotations(component.annotationsGroup);
        expect(updatedAnnotations.length).toBe(1);
        expect(updatedAnnotations[0].serverAnnotation().selectedValues.length).toBe(1);
        expect(updatedAnnotations[0].serverAnnotation().selectedValues).toContain(annotationType.options[0]);
      });

      it('checkboxes work for multiple select annotations', () => {
        const annotationType = new AnnotationType().deserialize(factory.multipleSelectAnnotationType());
        const { annotation } = createAnnotation({ annotationType });

        component.annotations = [ annotation ];
        fixture.detectChanges();

        const annotationOptionsElements = fixture.debugElement.queryAll(By.css('[type="checkbox"]'));
        expect(annotationOptionsElements.length).toBe(annotationType.options.length);
        annotationOptionsElements[0].nativeElement.click();
        fixture.detectChanges();

        const updatedAnnotations = AnnotationsAddSubformComponent.valueToAnnotations(component.annotationsGroup);
        expect(updatedAnnotations.length).toBe(1);
        expect(updatedAnnotations[0].serverAnnotation().selectedValues.length).toBe(1);
        expect(updatedAnnotations[0].serverAnnotation().selectedValues).toContain(annotationType.options[0]);
      });

    });

  });

  it('controlName returns lowercase name with spaces removed', () => {
    const annotationType = new AnnotationType().deserialize({
      ...factory.annotationType(),
      name: faker.lorem.words(5)
    });
    const { annotation } = createAnnotation({ annotationType });
    expect(AnnotationsAddSubformComponent.controlName(annotation))
      .toEqual(annotationType.name.toLocaleLowerCase().replace(/\s/g, ''));
  });

  function createAnnotation(options: AnnotationSpecCommon.AnnotationOptions = {}) {
      return AnnotationSpecCommon.createAnnotation(options, factory);
  }

});
