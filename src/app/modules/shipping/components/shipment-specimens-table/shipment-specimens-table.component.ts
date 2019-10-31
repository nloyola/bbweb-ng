import { Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material';
import { ShipmentSpecimen, Shipment } from '@app/domain/shipments';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { ShipmentSpecimenAction, ShipmentSpecimenActionId } from './shipment-specimens-table.container';

@Component({
  selector: 'app-shipment-specimens-table-ui',
  templateUrl: './shipment-specimens-table.component.html',
  styleUrls: ['./shipment-specimens-table.component.scss']
})
export class ShipmentSpecimensTableComponent implements OnInit {
  @Input() specimensThisPage: ShipmentSpecimen;
  @Input() maxPages: number;
  @Input() totalSpecimens: number;
  @Input() loading: boolean;
  @Input() readOnly: Boolean;
  @Input() actions: ShipmentSpecimenAction[];

  @Output() sortBy = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() onAction = new EventEmitter<[ShipmentSpecimen, ShipmentSpecimenActionId]>();

  faVial = faVial;
  currentPage = 1;

  private viewAction: ShipmentSpecimenAction = {
    id: 'view',
    label: 'View Specimen',
    icon: 'search',
    iconClass: 'success-icon'
  };

  constructor() {}

  ngOnInit() {
    this.actions = [this.viewAction].concat(this.actions);
  }

  sortData(sort: Sort) {
    let sortField: string;
    switch (sort.direction) {
      case 'asc':
        sortField = sort.active;
        break;

      case 'desc':
        sortField = '-' + sort.active;
        break;

      default:
        sortField = '';
    }

    this.sortBy.emit(sortField);
  }

  public paginationPageChanged(page: number) {
    this.pageChanged.emit(page);
  }

  protected menuItemsForShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen): DropdownMenuItem[] {
    const result: DropdownMenuItem[] = this.actions.map(action => ({
      kind: 'selectable',
      ...action,
      onSelected: () => {
        this.onAction.emit([shipmentSpecimen, action.id]);
      }
    }));

    return result;
  }
}
