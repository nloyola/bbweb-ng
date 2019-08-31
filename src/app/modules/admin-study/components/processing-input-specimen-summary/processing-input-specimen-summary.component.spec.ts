import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingInputSpecimenSummaryComponent } from './processing-input-specimen-summary.component';
import { Factory } from '@test/factory';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { TruncatePipe } from '@app/shared/pipes';
import { ProcessingType, CollectionEventType } from '@app/domain/studies';
import { ProcessingTypeFixture } from '@test/fixtures';

describe('ProcessingInputSpecimenSummaryComponent', () => {
  let component: ProcessingInputSpecimenSummaryComponent;
  let fixture: ComponentFixture<ProcessingInputSpecimenSummaryComponent>;
  const factory = new Factory();
  const entitiesFixture = new ProcessingTypeFixture(factory);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessingInputSpecimenSummaryComponent, TruncatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingInputSpecimenSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
    const processingType = new ProcessingType().deserialize(factory.processingType());
    component.input = processingType.input;
    component.inputEntity = eventType;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('detects changes to input entity', () => {
    it('when input entity is an event type', () => {
      const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
      const processingType = new ProcessingType().deserialize(factory.processingType());
      component.input = processingType.input;
      component.inputEntity = eventType;
      fixture.detectChanges();

      const otherEventType = new CollectionEventType().deserialize(
        factory.collectionEventType({
          specimenDefinitions: [factory.collectedSpecimenDefinition()]
        })
      );
      component.ngOnChanges({
        inputEntity: new SimpleChange(null, otherEventType, false)
      });
    });

    it('when input entity is a processing type', () => {
      const { eventType, input, processingType } = entitiesFixture.createProcessingTypeFromProcessed();
      component.input = processingType.input;
      component.inputEntity = input;
      fixture.detectChanges();

      const otherProcessingType = new ProcessingType().deserialize(factory.processingType());
      component.ngOnChanges({
        inputEntity: new SimpleChange(null, otherProcessingType, false)
      });
      expect(component.inputEntity).toEqual(otherProcessingType);
    });
  });
});
