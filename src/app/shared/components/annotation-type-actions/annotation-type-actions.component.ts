import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AnnotationType } from '@app/domain/annotations';
import { DropdownMenuItem, dropdownMenuSelectable } from '../dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-annotation-type-actions',
  template: '<app-dropdown-menu [menuItems]="menuItems" placement="bottom-right"></app-dropdown-menu>'
})
export class AnnotationTypeActionsComponent implements OnInit {
  @Input() annotationType: AnnotationType;
  @Input() modifyAllowed: boolean;

  @Output() viewSelected = new EventEmitter<AnnotationType>();
  @Output() editSelected = new EventEmitter<AnnotationType>();
  @Output() removeSelected = new EventEmitter<AnnotationType>();

  menuItems: DropdownMenuItem[];

  constructor() {}

  ngOnInit() {
    this.menuItems = [
      dropdownMenuSelectable(
        'View',
        () => {
          this.viewSelected.emit(this.annotationType);
        },
        'search',
        'success-icon'
      )
    ];

    if (this.modifyAllowed) {
      this.menuItems = [
        ...this.menuItems,
        dropdownMenuSelectable(
          'Edit',
          () => {
            this.editSelected.emit(this.annotationType);
          },
          'edit',
          'success-icon'
        ),
        dropdownMenuSelectable(
          'Remove',
          () => {
            this.removeSelected.emit(this.annotationType);
          },
          'remove_circle',
          'danger-icon'
        )
      ];
    }
  }
}
