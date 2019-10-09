import { TitleCasePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { Subject, timer } from 'rxjs';
import { debounce, distinct, takeUntil } from 'rxjs/operators';
import { CentreShipmentsViewMode } from '../centre-shipments-details/centre-shipments-details.component';

@Component({
  selector: 'app-shipments-table-view',
  templateUrl: './shipments-table-view.component.html',
  styleUrls: ['./shipments-table-view.component.scss']
})
export class ShipmentsTableViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode = CentreShipmentsViewMode.Incoming;
  @Input() shipments: Shipment[];
  @Input() numPages: number;
  @Input() totalShipments: number;

  @Output() sortBy = new EventEmitter<string>();
  @Output() filterByCourierName = new EventEmitter<string>();
  @Output() filterByTrackingNumber = new EventEmitter<string>();
  @Output() filterByState = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() viewShipment = new EventEmitter<Shipment>();
  @Output() removeShipment = new EventEmitter<Shipment>();

  filterForm: FormGroup;
  shipmentStates: ShipmentState[];
  currentPage: number;
  filterByLabel = 'Filter by state';
  sourceLabel: string;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder, private titleCasePipe: TitleCasePipe) {
    this.currentPage = 1;
    this.shipmentStates = Object.values(ShipmentState).filter(state => state !== ShipmentState.Completed);
  }

  ngOnInit() {
    if (this.mode === 'outgoing') {
      this.sourceLabel = 'To';
    } else {
      this.sourceLabel = 'From';
    }
    if (!this.shipments) {
      this.shipments = [];
    }

    this.filterForm = this.formBuilder.group({
      courierName: '',
      trackingNumber: ''
    });

    // debounce the input to the courierName filter and then apply it to the search
    this.courierName.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        this.filterByCourierName.emit(value);
      });

    // debounce the input to the trackingNumber filter and then apply it to the search
    this.trackingNumber.valueChanges
      .pipe(
        debounce(() => timer(500)),
        distinct(() => this.filterForm.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(value => {
        this.filterByTrackingNumber.emit(value);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.shipments && changes.shipments.currentValue) {
      this.shipments = changes.shipments.currentValue;
    }

    if (changes.numPages) {
      this.numPages = changes.numPages.currentValue;
    }

    if (changes.totalShipments) {
      this.totalShipments = changes.totalShipments.currentValue;
    }
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get trackingNumber() {
    return this.filterForm.get('trackingNumber');
  }

  get courierName() {
    return this.filterForm.get('courierName');
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

    if (sort.active === 'date') {
      console.error('invalid sort field');
      return;
    }

    this.sortBy.emit(sortField);
  }

  public paginationPageChanged(page: number) {
    if (isNaN(page)) {
      return;
    }
    this.currentPage = page;
    this.pageChanged.emit(page);
  }

  public filterUpdated(state: ShipmentState) {
    if (state === undefined) {
      this.filterByLabel = 'Filter by state';
    } else {
      this.filterByLabel = 'By ' + this.titleCasePipe.transform(state);
    }
    this.filterByState.emit(state);
  }

  menuItemsForShipment(shipment: Shipment): DropdownMenuItem[] {
    const result: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'View Shipment',
        icon: 'search',
        iconClass: 'success-icon',
        onSelected: () => {
          this.viewShipment.emit(shipment);
        }
      }
    ];

    if (shipment.isCreated()) {
      result.push({
        kind: 'selectable',
        label: 'Remove Shipment',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.removeShipment.emit(shipment);
        }
      });
    }
    return result;
  }
}
