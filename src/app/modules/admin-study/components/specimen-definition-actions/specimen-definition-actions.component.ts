import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SpecimenDefinition } from '@app/domain/studies';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-specimen-definition-actions',
  template: '<app-dropdown-menu [menuItems]="menuItems" placement="bottom-right"></app-dropdown-menu>',
  styleUrls: ['./specimen-definition-actions.component.scss']
})
export class SpecimenDefinitionActionsComponent implements OnInit {
  @Input() specimenDefinition: SpecimenDefinition;
  @Input() modifyAllowed: boolean;

  @Output() viewSelected = new EventEmitter<SpecimenDefinition>();
  @Output() editSelected = new EventEmitter<SpecimenDefinition>();
  @Output() removeSelected = new EventEmitter<SpecimenDefinition>();

  menuItems: DropdownMenuItem[];

  constructor() {}

  ngOnInit() {
    this.menuItems = [
      {
        kind: 'selectable',
        label: 'View',
        icon: 'search',
        iconClass: 'success-icon',
        onSelected: () => {
          this.viewSelected.emit(this.specimenDefinition);
        }
      }
    ];

    if (this.modifyAllowed) {
      this.menuItems.push(
        {
          kind: 'selectable',
          label: 'Edit',
          icon: 'edit',
          iconClass: 'success-icon',
          onSelected: () => {
            this.editSelected.emit(this.specimenDefinition);
          }
        },
        {
          kind: 'selectable',
          label: 'Remove',
          icon: 'remove_circle',
          iconClass: 'danger-icon',
          onSelected: () => {
            this.removeSelected.emit(this.specimenDefinition);
          }
        }
      );
    }
  }
}
