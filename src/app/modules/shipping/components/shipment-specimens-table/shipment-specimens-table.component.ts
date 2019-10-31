import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Sort } from '@angular/material';
import { ShipmentSpecimen } from '@app/domain/shipments';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { faVial } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-shipment-specimens-table-ui',
  templateUrl: './shipment-specimens-table.component.html',
  styleUrls: ['./shipment-specimens-table.component.scss']
})
export class ShipmentSpecimensTableComponent {
  // implements OnInit {
  @Input() specimensThisPage: ShipmentSpecimen;
  @Input() maxPages: number;
  @Input() totalSpecimens: number;
  @Input() loading: boolean;
  @Input() readOnly: Boolean;

  @Output() sortBy = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();

  @Output() onView = new EventEmitter<ShipmentSpecimen>();
  @Output() onRemove = new EventEmitter<ShipmentSpecimen>();

  faVial = faVial;
  currentPage = 1;

  constructor() {}

  //ngOnInit() {}

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
    const result: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'View Specimen',
        icon: 'search',
        iconClass: 'success-icon',
        onSelected: () => {
          this.onView.emit(shipmentSpecimen);
        }
      }
    ];

    if (!this.readOnly) {
      result.push({
        kind: 'selectable',
        label: 'Remove Specimen from Shipment',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.onRemove.emit(shipmentSpecimen);
        }
      });
    }
    return result;
  }
}
