import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecimenDefinitionActionsComponent } from './specimen-definition-actions.component';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

describe('SpecimenDefinitionActionsComponent', () => {
  let component: SpecimenDefinitionActionsComponent;
  let fixture: ComponentFixture<SpecimenDefinitionActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpecimenDefinitionActionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionActionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe.each`
    label       | outputName
    ${'View'}   | ${'viewSelected'}
    ${'Edit'}   | ${'editSelected'}
    ${'Remove'} | ${'removeSelected'}
  `('for menu item with label "$label"', ({ label, outputName }) => {
    it('menu item exists', () => {
      component.modifyAllowed = true;
      fixture.detectChanges();
      const menuItem = component.menuItems.find(item => item.kind === 'selectable' && item.label === label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      expect(selectableMenuItem).toBeTruthy();
      expect(selectableMenuItem.onSelected).toBeFunction();
    });

    it('when selected, emits an event', () => {
      component.modifyAllowed = true;
      fixture.detectChanges();

      const menuItem = component.menuItems.find(item => item.kind === 'selectable' && item.label === label);
      const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
      let eventProduced = false;

      expect(component[outputName]).toBeDefined();
      component[outputName].subscribe(() => {
        eventProduced = true;
      });

      selectableMenuItem.onSelected();
      expect(eventProduced).toBe(true);
    });
  });
});
