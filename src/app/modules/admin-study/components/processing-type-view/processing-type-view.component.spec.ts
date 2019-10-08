import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingType } from '@app/domain/studies';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { ProcessingTypeFixture } from '@test/fixtures';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProcessingTypeViewComponent } from './processing-type-view.component';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

describe('ProcessingTypeViewComponent', () => {
  let component: ProcessingTypeViewComponent;
  let fixture: ComponentFixture<ProcessingTypeViewComponent>;
  const factory = new Factory();
  const entityFixture = new ProcessingTypeFixture(factory);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      declarations: [ProcessingTypeViewComponent, YesNoPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('changes are handled', () => {
    const entities = entityFixture.createEntities();
    component.processingType = entities.processingType;
    fixture.detectChanges();
    expect(component.processingType).toBeDefined();

    const inUseProcessingType = new ProcessingType().deserialize({
      ...(entities.processingType as any),
      inUse: true
    });

    component.ngOnChanges({
      processingType: new SimpleChange(entities.processingType, inUseProcessingType, false)
    });

    expect(component.processingType).toBe(inUseProcessingType);
  });

  describe('for event emitters', () => {
    const compUpdateMethodName = [
      'viewAnnotationType',
      'editAnnotationType',
      'removeAnnotationType',
      'removeProcessingType'
    ];

    it.each(compUpdateMethodName)('emits the %sSelected event', methodName => {
      const entities = entityFixture.createEntities();
      component.processingType = entities.processingType;
      fixture.detectChanges();

      let eventProduced = false;
      const emitterName = `${methodName}Selected`;
      component[emitterName].subscribe(() => {
        eventProduced = true;
      });
      expect(component[methodName]).toBeFunction();

      component[methodName]();
      expect(eventProduced).toBe(true);
    });
  });

  describe('for menu items', () => {
    const menuItemData = [
      ['Update Name', 'updateNameSelected'],
      ['Update Description', 'updateDescriptionSelected'],
      ['Update Enabled', 'updateEnabledSelected'],
      ['Add Annotation', 'addAnnotationTypeSelected'],
      ['Remove this Step', 'removeProcessingTypeSelected']
    ];

    it.each(menuItemData)('menu item "%s" emits the "%s" event', (label, emitterName) => {
      const entities = entityFixture.createEntities();
      component.processingType = entities.processingType;
      fixture.detectChanges();

      let eventProduced = false;
      component[emitterName].subscribe(() => {
        eventProduced = true;
      });

      const menuItem = component.stepMenuItems.find(mi => mi.kind === 'selectable' && mi.label == label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      expect(selectableMenuItem).toBeDefined();
      expect(selectableMenuItem.onSelected).toBeFunction();
      selectableMenuItem.onSelected();
      expect(eventProduced).toBe(true);
    });
  });

  describe('for input menu items', () => {
    const menuItemData = [['Make changes to the Input Specimen', 'inputSpecimenUpdateSelected']];

    it.each(menuItemData)('menu item %s emits the %sSelected event', (label, emitterName) => {
      const entities = entityFixture.createEntities();
      component.processingType = entities.processingType;
      fixture.detectChanges();

      let eventProduced = false;
      component[emitterName].subscribe(() => {
        eventProduced = true;
      });

      const menuItem = component.inputMenuItems.find(mi => mi.kind === 'selectable' && mi.label == label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      expect(selectableMenuItem).toBeDefined();
      expect(selectableMenuItem.onSelected).toBeFunction();
      selectableMenuItem.onSelected();
      expect(eventProduced).toBe(true);
    });
  });

  describe('for output menu items', () => {
    const menuItemData = [['Make changes to the Output Specimen', 'outputSpecimenUpdateSelected']];

    it.each(menuItemData)('menu item %s emits the %sSelected event', (label, emitterName) => {
      const entities = entityFixture.createEntities();
      component.processingType = entities.processingType;
      fixture.detectChanges();

      let eventProduced = false;
      component[emitterName].subscribe(() => {
        eventProduced = true;
      });

      const menuItem = component.outputMenuItems.find(mi => mi.kind === 'selectable' && mi.label == label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      expect(selectableMenuItem).toBeDefined();
      expect(selectableMenuItem.onSelected).toBeFunction();
      selectableMenuItem.onSelected();
      expect(eventProduced).toBe(true);
    });
  });
});
