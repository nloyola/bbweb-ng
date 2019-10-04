import { Component, Input, OnInit } from '@angular/core';

export type DropdownMenuPlacement =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'left-top'
  | 'left-bottom'
  | 'right'
  | 'right-top'
  | 'right-bottom';

export interface DropdownMenuHeader {
  kind: 'header';
  readonly header: string;
}

export interface DropdownMenuDividerItem {
  kind: 'divider';
}

export interface DropdownMenuSelectableItem {
  kind: 'selectable';
  readonly label: string;
  readonly onSelected: () => void;
  readonly icon?: string;
  readonly iconClass?: string;
}

export type DropdownMenuItem = DropdownMenuHeader | DropdownMenuDividerItem | DropdownMenuSelectableItem;

export const DropdownMenuDivider: DropdownMenuDividerItem = { kind: 'divider' };

export function dropdownMenuHeader(label: string): DropdownMenuHeader {
  return {
    kind: 'header',
    header: label
  };
}

export function dropdownMenuSelectable(
  label: string,
  onSelected: () => void,
  icon?: string,
  iconClass?: string
): DropdownMenuSelectableItem {
  return {
    kind: 'selectable',
    label,
    onSelected,
    icon,
    iconClass
  };
}

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent implements OnInit {
  @Input() buttonClass: string = 'btn btn-sm btn-outline-secondary';
  @Input() menuItems: DropdownMenuItem[] = [];
  @Input() placement: DropdownMenuPlacement = 'right-top';

  constructor() {}

  ngOnInit() {}
}
