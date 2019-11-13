import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IconClass, PagedReplyInfo } from '@app/domain';
import { SearchFilter } from '@app/domain/search-filters';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { SpecimenViewModalComponent } from '@app/modules/modals/components/specimen-view-modal/specimen-view-modal.component';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

interface ShipmentSpecimenData {
  pageInfo$: Observable<PagedReplyInfo<ShipmentSpecimen>>;
  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  specimens$: Observable<ShipmentSpecimen[]>;
  sortField: string;
  currentPage: number;
}

export type ShipmentSpecimenActionId = 'view' | 'remove' | 'tagAsPresent' | 'tagAsReceived ' | 'tagAsMissing';

export interface ShipmentSpecimenAction {
  readonly id: ShipmentSpecimenActionId;
  readonly label: string;
  readonly icon: string;
  readonly iconClass: IconClass;
}

@Component({
  selector: 'app-shipment-specimens-table',
  templateUrl: './shipment-specimens-table.container.html'
})
export class ShipmentSpecimensTableContainerComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;
  @Input() readOnly = true;
  @Input() baseFilter: SearchFilter = undefined;
  @Input() actions: ShipmentSpecimenAction[] = [];

  @Output() onAction = new EventEmitter<[ShipmentSpecimen, ShipmentSpecimenActionId]>();

  shipmentSpecimenData: ShipmentSpecimenData;
  isLoading$ = new BehaviorSubject<boolean>(true);
  filters: SearchFilter[] = [];

  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private modalService: NgbModal) {
    this.shipmentSpecimenData = this.createShipmentSpecimenData();
  }

  ngOnInit() {
    if (this.baseFilter) {
      this.filters.push(this.baseFilter);
    }

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchActive),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(active => {
        this.isLoading$.next(active);
      });

    // this selector updates the shipment specimens table when the shipment is modified
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectAllShipmentEntities),
        map(shipments => {
          const shipmentEntity = shipments[this.shipment.id];
          if (shipmentEntity) {
            return shipmentEntity instanceof Shipment
              ? shipmentEntity
              : new Shipment().deserialize(shipmentEntity);
          }
          return undefined;
        }),
        filter(shipment => shipment !== undefined),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.shipmentSpecimenData.currentPage = 1;
        this.updateSpecimens();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  specimensTableSortBy(sortField: string): void {
    this.shipmentSpecimenData.sortField = sortField;
    this.updateSpecimens();
  }

  specimensTablePageChanged(page: number): void {
    this.shipmentSpecimenData.currentPage = page;
    this.updateSpecimens();
  }

  shipmentSpecimenAction([shipmentSpecimen, actionId]) {
    switch (actionId) {
      case 'view':
        this.viewShipmentSpecimen(shipmentSpecimen);
        break;
      default:
        this.onAction.emit([shipmentSpecimen, actionId]);
    }
  }

  private viewShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    const modalRef = this.modalService.open(SpecimenViewModalComponent, { size: 'lg' });
    modalRef.componentInstance.specimen = shipmentSpecimen.specimen;
  }

  private createShipmentSpecimenData(): ShipmentSpecimenData {
    const pageInfo$ = this.store$.pipe(
      select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
      filter(info => info !== undefined),
      shareReplay()
    );

    const specimens$ = pageInfo$.pipe(map(info => info.entities.filter(e => e !== undefined)));
    const maxPages$ = pageInfo$.pipe(map(info => info.maxPages));
    const totalSpecimens$ = pageInfo$.pipe(map(info => info.total));

    return {
      pageInfo$,
      specimens$,
      maxPages$,
      totalSpecimens$,
      sortField: 'inventoryId',
      currentPage: 1
    };
  }

  private updateSpecimens(): void {
    const filterValues = this.filters
      .filter(f => f !== undefined)
      .map(f => f.getValue())
      .join(';');
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {
          filter: filterValues,
          sort: this.shipmentSpecimenData.sortField,
          page: this.shipmentSpecimenData.currentPage
        }
      })
    );
  }
}
