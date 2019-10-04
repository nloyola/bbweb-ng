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

export interface DropdownMenuItem {
  label: string;
  icon: string;
  iconClass: string;
  selected: () => void;
}

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent implements OnInit {
  @Input() menuItems: DropdownMenuItem[] = [];
  @Input() placement: DropdownMenuPlacement = 'right-top';

  constructor() {}

  ngOnInit() {}
}
