import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionEventType } from '@app/domain/studies';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EventTypeViewComponent } from './event-type-view.component';

describe('EventTypeViewComponent', () => {
  let component: EventTypeViewComponent;
  let fixture: ComponentFixture<EventTypeViewComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        NgbModule
      ],
      declarations: [
        EventTypeViewComponent,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    factory = new Factory();
    fixture = TestBed.createComponent(EventTypeViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.eventType = undefined;
    component.allowChanges = false;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should sort annotationTypes and specimenDefinitions types on initialization', () => {
    const eventType = createTestEventType(factory);
    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();
    expect(component.sortedAnnotationTypes).toBeDefined();
    expect(component.sortedSpecimenDefinitions).toBeDefined();

    expect(component.sortedAnnotationTypes.length).toBe(eventType.annotationTypes.length);
    expect(component.sortedSpecimenDefinitions.length).toBe(eventType.specimenDefinitions.length);
  });

  it('sorted annotationTypes and specimenDefinitions are empty when event type is undefined', () => {
    const eventType = createTestEventType(factory);
    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();

    component.ngOnChanges({
      eventType: new SimpleChange(null, undefined, false)
    });

    expect(component.sortedAnnotationTypes.length).toBe(0);
    expect(component.sortedSpecimenDefinitions.length).toBe(0);
  });

  it('test for emitters', () => {
    const eventType = createTestEventType(factory);
    const annotationType = eventType.annotationTypes[0];
    const specimenDefinition = eventType.specimenDefinitions[0];
    const testData = [
      {
        componentFunc: () => component.updateName(),
        emitter: component.updateNameSelected,
        arg: null
      },
      {
        componentFunc: () => component.updateDescription(),
        emitter: component.updateDescriptionSelected,
        arg: null
      },
      {
        componentFunc: () => component.updateRecurring(),
        emitter: component.updateRecurringSelected,
        arg: null
      },
      {
        componentFunc: () => component.addAnnotationType(),
        emitter: component.addAnnotationTypeSelected,
        arg: null
      },
      {
        componentFunc: () => component.viewAnnotationType(annotationType),
        emitter: component.viewAnnotationTypeSelected,
        arg: annotationType
      },
      {
        componentFunc: () => component.editAnnotationType(annotationType),
        emitter: component.editAnnotationTypeSelected,
        arg: annotationType
      },
      {
        componentFunc: () => component.removeAnnotationType(annotationType),
        emitter: component.removeAnnotationTypeSelected,
        arg: annotationType
      },
      {
        componentFunc: () => component.addSpecimenDefinition(),
        emitter: component.addSpecimenDefinitionSelected,
        arg: null
      },
      {
        componentFunc: () => component.viewSpecimenDefinition(specimenDefinition),
        emitter: component.viewSpecimenDefinitionSelected,
        arg: specimenDefinition
      },
      {
        componentFunc: () => component.editSpecimenDefinition(specimenDefinition),
        emitter: component.editSpecimenDefinitionSelected,
        arg: specimenDefinition
      },
      {
        componentFunc: () => component.removeSpecimenDefinition(specimenDefinition),
        emitter: component.removeSpecimenDefinitionSelected,
        arg: specimenDefinition
      },
      {
        componentFunc: () => component.removeEventType(),
        emitter: component.removeEventTypeSelected,
        arg: null
      }
    ];

    component.eventType = createTestEventType(factory);
    component.allowChanges = false;
    fixture.detectChanges();

    testData.forEach(testInfo => {
      spyOn(testInfo.emitter, 'emit').and.returnValue(null);
      testInfo.componentFunc();
      expect(testInfo.emitter.emit).toHaveBeenCalledWith(testInfo.arg);
    });

  });

  function createTestEventType(): CollectionEventType {
    return new CollectionEventType().deserialize({
      ...factory.collectionEventType(),
      annotationTypes: [
        factory.annotationType(),
        factory.annotationType()
      ],
      specimenDefinitions: [
        factory.collectedSpecimenDefinition(),
        factory.collectedSpecimenDefinition()
      ]
    });
  }
});
