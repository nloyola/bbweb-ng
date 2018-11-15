import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnotationTypeAddComponent } from './annotation-type-add.component';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { AnnotationType, ValueTypes } from '@app/domain/annotations';
import { Factory } from '@app/test/factory';

describe('AnnotationTypeAddComponent', () => {

  let component: AnnotationTypeAddComponent;
  let fixture: ComponentFixture<AnnotationTypeAddComponent>;
  let factory: Factory;

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
    factory = new Factory();
    fixture = TestBed.createComponent(AnnotationTypeAddComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('can be created with an existing annotation', () => {
    Object.values(ValueTypes).forEach(valueType => {

      component.annotationType = new AnnotationType().deserialize({
        ...factory.annotationType(),
        id: factory.stringNext(),
        valueType,
        options: (valueType === ValueTypes.Select) ? ['opt1', 'opt2'] : undefined
      });

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.name.value).toEqual(component.annotationType.name);
      expect(component.description.value).toEqual(component.annotationType.description);
      expect(component.valueType.value).toEqual(component.annotationType.valueType);
      expect(component.maxValueCount.value).toEqual(component.annotationType.maxValueCount);
      expect(component.required.value).toEqual(component.annotationType.required);
      expect(component.options).toBeDefined();

      if (valueType === ValueTypes.Select) {
        expect(component.options.length).toBeGreaterThan(0);
      } else {
        expect(component.options.length).toBe(0);
      }
    });
  });

  it('annotation type can be assigned using change detection', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();

    const newAnnotationType = new AnnotationType().deserialize({
      ...factory.annotationType(),
      id: factory.stringNext()
    });

    component.ngOnChanges({
      annotationType: new SimpleChange(null, newAnnotationType)
    });
    fixture.detectChanges();
    expect(component.annotationType).toBe(newAnnotationType)
    expect(component.title).toBe('Update Annotation');
  });

  it('test for emitters', () => {
    const annotationType = new AnnotationType().deserialize({
      ...factory.annotationType(),
      valueType: ValueTypes.Select,
      maxValueCount: 2,
      options: [ 'opt1', 'opt2'],
      id: factory.stringNext()
    });
    const testData = [
      {
        componentFunc: () => component.onSubmit(),
        emitter: component.submitted
      },
      {
        componentFunc: () => component.onCancel(),
        emitter: component.cancelled
      }
    ];

    component.annotationType = annotationType;
    fixture.detectChanges();

    testData.forEach(testInfo => {
      jest.spyOn(testInfo.emitter, 'emit').mockReturnValue(null);
      testInfo.componentFunc();
      expect(testInfo.emitter.emit).toHaveBeenCalled();
    });

  });
});
