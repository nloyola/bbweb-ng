import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PagedReplyInfo } from '@app/domain';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreSelectors
} from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewModalComponent } from '@app/modules/modals/components/specimen-view-modal/specimen-view-modal.component';

interface ShipmentSpecimenData {
  pageInfo$: Observable<PagedReplyInfo<ShipmentSpecimen>>;
  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  specimens$: Observable<ShipmentSpecimen[]>;
  sortField: string;
  currentPage: number;
}

@Component({
  selector: 'app-shipment-specimens-table',
  template: `
    <app-shipment-specimens-table-ui
      [specimensThisPage]="shipmentSpecimenData.specimens$ | async"
      [maxPages]="shipmentSpecimenData.maxPages$ | async"
      [totalSpecimens]="shipmentSpecimenData.totalSpecimens$ | async"
      [readOnly]="readOnly"
      (sortBy)="specimensTableSortBy($event)"
      (pageChanged)="specimensTablePageChanged($event)"
      (onView)="viewShipmentSpecimen($event)"
      (onRemove)="removeShipmentSpecimen($event)"
    ></app-shipment-specimens-table-ui>
  `,
  styleUrls: ['./shipment-specimens-table.component.scss']
})
export class ShipmentSpecimensTableContainerComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;
  @Input() readOnly = true;

  @Output() onRemove = new EventEmitter<ShipmentSpecimen>();

  shipmentSpecimenData: ShipmentSpecimenData;

  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private modalService: NgbModal) {
    this.shipmentSpecimenData = this.createShipmentSpecimenData();
  }

  ngOnInit() {
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
        this.updateSpecimens();
      });

    // reload the table if any shipment specimen is removed
    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenLastRemovedId),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
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

  viewShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    const modalRef = this.modalService.open(SpecimenViewModalComponent, { size: 'lg' });
    modalRef.componentInstance.specimen = shipmentSpecimen.specimen;
  }

  removeShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    this.onRemove.emit(shipmentSpecimen);
  }

  private createShipmentSpecimenData(): ShipmentSpecimenData {
    const pageInfo$ = this.store$.pipe(
      select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
      filter(x => x !== undefined),
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
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {
          sort: this.shipmentSpecimenData.sortField,
          page: this.shipmentSpecimenData.currentPage
        }
      })
    );
  }
}
