import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionEventType } from '@app/domain/studies';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EventTypeViewComponent } from './event-type-view.component';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

describe('EventTypeViewComponent', () => {
  let component: EventTypeViewComponent;
  let fixture: ComponentFixture<EventTypeViewComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [NgbModule],
      declarations: [EventTypeViewComponent, YesNoPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
    const eventType = createTestEventType();
    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();
    expect(component.sortedAnnotationTypes).toBeDefined();
    expect(component.sortedSpecimenDefinitions).toBeDefined();

    expect(component.sortedAnnotationTypes.length).toBe(eventType.annotationTypes.length);
    expect(component.sortedSpecimenDefinitions.length).toBe(eventType.specimenDefinitions.length);
  });

  it('sorted annotationTypes and specimenDefinitions are empty when event type is undefined', () => {
    const eventType = createTestEventType();
    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();

    component.ngOnChanges({
      eventType: new SimpleChange(null, undefined, false)
    });

    expect(component.sortedAnnotationTypes.length).toBe(0);
    expect(component.sortedSpecimenDefinitions.length).toBe(0);
  });

  const outputData = [
    ['viewAnnotationType', 'viewAnnotationTypeSelected', 'annotationType'],
    ['editAnnotationType', 'editAnnotationTypeSelected', 'annotationType'],
    ['removeAnnotationType', 'removeAnnotationTypeSelected', 'annotationType'],
    ['viewSpecimenDefinition', 'viewSpecimenDefinitionSelected', 'specimenDefinition'],
    ['editSpecimenDefinition', 'editSpecimenDefinitionSelected', 'specimenDefinition'],
    ['removeSpecimenDefinition', 'removeSpecimenDefinitionSelected', 'specimenDefinition']
  ];

  it.each(outputData)('method %s emits event %s', (componentMethod, outputName, argumentType) => {
    const eventType = createTestEventType();
    const argument =
      argumentType == 'annotationType' ? eventType.annotationTypes[0] : eventType.specimenDefinitions[0];

    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();

    expect(component[outputName]).toBeDefined();
    const emitterListener = jest.spyOn(component[outputName], 'emit').mockReturnValue(null);

    expect(component[componentMethod]).toBeFunction();
    component[componentMethod](argument);
    expect(emitterListener.mock.calls.length).toBe(1);
    expect(emitterListener.mock.calls[0][0]).toBe(argument);
  });

  const menuItemData = [
    ['Update Name', 'updateNameSelected'],
    ['Update Description', 'updateDescriptionSelected'],
    ['Update Recurring', 'updateRecurringSelected'],
    ['Add Annotation', 'addAnnotationTypeSelected'],
    ['Remove this Event', 'removeEventTypeSelected']
  ];

  it.each(menuItemData)('menu item "%s" emits the "%s" event', (itemLabel, outputName) => {
    const eventType = createTestEventType();

    component.eventType = eventType;
    component.allowChanges = false;
    fixture.detectChanges();

    expect(component[outputName]).toBeDefined();
    let eventProduced = false;
    component[outputName].subscribe(() => {
      eventProduced = true;
    });

    const menuItem = component.menuItems.find(mi => mi.kind === 'selectable' && mi.label == itemLabel);
    const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
    expect(selectableMenuItem).toBeDefined();
    expect(selectableMenuItem.onSelected).toBeFunction();
    selectableMenuItem.onSelected();
    expect(eventProduced).toBe(true);
  });

  function createTestEventType(): CollectionEventType {
    return new CollectionEventType().deserialize({
      ...factory.collectionEventType({
        annotationTypes: [factory.annotationType(), factory.annotationType()],
        specimenDefinitions: [factory.collectedSpecimenDefinition(), factory.collectedSpecimenDefinition()]
      })
    });
  }
});
