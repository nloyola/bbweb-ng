import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Annotation, AnnotationFactory, AnnotationType, ValueTypes } from '@app/domain/annotations';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AnnotationsAddSubformComponent } from '../annotations-add-subform/annotations-add-subform.component';
import { ModalInputAnnotationComponent } from './modal-input-annotation.component';
import { AnnotationSpecCommon } from '@test/annotation-spec-common';

describe('ModalInputAnnotationComponent', () => {
  let component: ModalInputAnnotationComponent;
  let fixture: ComponentFixture<ModalInputAnnotationComponent>;
  const factory = new Factory();
  let annotation: Annotation;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [
        ModalInputAnnotationComponent,
        AnnotationsAddSubformComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputAnnotationComponent);
    component = fixture.componentInstance;
    component.options = {};
  });

  it('should create', () => {
    const { annotation } = createAnnotation();
    component.annotation = annotation;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('for modalInputValid$', fakeAsync(() => {
    const testData = [
      { value: factory.stringNext(), expected: true },
      { value: '',                   expected: false }
    ];
    const annotationType = new AnnotationType().deserialize(factory.annotationType({
      valueType: ValueTypes.Text,
      required: true
    }));
    const { annotation } = createAnnotation({ annotationType });
    component.annotation = annotation;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toBeGreaterThan(0);

    testData.forEach(testInfo => {
      inputElements[0].nativeElement.value = testInfo.value;
      inputElements[0].nativeElement.dispatchEvent(new Event('input'));
      tick(500);
      fixture.detectChanges();
    });

    expect(component.modalInputValid$).toBeObservable(cold('(ab)', { a: true, b: false }));
  }));

  it('annotationsGroup getter returns a valid object', () => {
    const { annotation } = createAnnotation();
    component.annotation = annotation;
    fixture.detectChanges();
    expect((component.annotationsGroup.get('annotations') as FormArray).length).toBe(1);
  });

  describe('when the user presses OK', () => {

    it('closes the modal and passes an annotation', () => {
      const closeListener = jest.fn();
      const mockModal = {
        close: closeListener,
        dismiss: undefined
      } as NgbActiveModal;

      const { annotation } = createAnnotation();
      component.annotation = annotation;
      component.modal = mockModal;
      fixture.detectChanges();
      component.confirm();
      expect(closeListener.mock.calls.length).toBe(1);
      expect(closeListener.mock.calls[0][0]).toEqual({
        annotationTypeId: annotation.annotationTypeId,
        valueType: annotation.valueType,
        id: null,
        value: null
      });
    });

    it('throws an error if annotationsGroup has more than one annotation', () => {
      const closeListener = jest.fn();
      const mockModal = {
        close: closeListener,
        dismiss: undefined
      } as NgbActiveModal;

      const { annotation } = createAnnotation();
      component.annotation = annotation;
      component.modal = mockModal;
      fixture.detectChanges();

      component.annotationsGroup.setControl(
        'annotations',
        AnnotationsAddSubformComponent.buildSubForm([ annotation, annotation ], null));
      expect(() => {
        component.confirm();
      }).toThrowError(/there should only be one annotation being modified/);
    });

  });

  it('dismiss closes the modal', () => {
    const dismissListener = jest.fn();
    const mockModal = {
      close: undefined,
      dismiss: dismissListener
    } as NgbActiveModal;

    const { annotation } = createAnnotation();
    component.annotation = annotation;
    component.modal = mockModal;
    fixture.detectChanges();
    component.dismiss();
    expect(dismissListener.mock.calls.length).toBe(1);
  });

  function createAnnotation(options: AnnotationSpecCommon.AnnotationOptions = {}) {
    return AnnotationSpecCommon.createAnnotation(options, factory);
  }

});
