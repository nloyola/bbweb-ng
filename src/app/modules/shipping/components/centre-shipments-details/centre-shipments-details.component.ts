import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedReplyInfo } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { StateFilter } from '@app/domain/search-filters';
import { CourierNameFilter } from '@app/domain/search-filters/courier-name-filter.model';
import { TrackingNumberFilter } from '@app/domain/search-filters/tracking-number-filter.model';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreActions,
  ShipmentStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, withLatestFrom, shareReplay } from 'rxjs/operators';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentNotInCreatedModalComponent } from '../shipment-not-in-created-modal/shipment-not-in-created-modal.component';

export enum CentreShipmentsViewMode {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
  Completed = 'completed'
}

/**
 *
 */
@Component({
  selector: 'app-centre-shipments-details',
  templateUrl: './centre-shipments-details.component.html',
  styleUrls: ['./centre-shipments-details.component.scss']
})
export class CentreShipmentsDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('removeShipmentModal', { static: false }) removeShipmentModal: TemplateRef<any>;
  @ViewChild('hasSpecimensModal', { static: false }) hasSpecimensModal: TemplateRef<any>;
  @ViewChild('shipmentNotInCreated', { static: false }) shipmentNotInCreated: TemplateRef<any>;

  centre: Centre;
  pageInfo$: Observable<PagedReplyInfo<Shipment>>;

  maxPages$: Observable<number>;
  totalShipments$: Observable<number>;
  shipments$: Observable<Shipment[]>;
  sortField: string;
  currentPage: number;
  courierNameFilter = new CourierNameFilter();
  trackingNumberFilter = new TrackingNumberFilter();
  stateFilter: StateFilter;
  mode: CentreShipmentsViewMode;

  private shipmentToRemove$ = new Subject<Shipment>();
  private updatedMessage$ = new Subject<string>();
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    protected store$: Store<RootStoreState.State>,
    protected router: Router,
    protected route: ActivatedRoute,
    protected modalService: NgbModal,
    protected toastr: ToastrService
  ) {}

  ngOnInit() {
    this.centre = this.route.parent.parent.snapshot.data.centre;
    this.mode = this.determineMode();

    this.initCheckRemoved();

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities),
      filter(x => x !== undefined),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipments$ = this.pageInfo$.pipe(
      map(info =>
        info.entities
          .filter((s: any) => s !== undefined)
          .map((s: any) => (s instanceof Shipment ? s : new Shipment().deserialize(s)))
      )
    );
    this.maxPages$ = this.pageInfo$.pipe(map(info => info.maxPages));
    this.totalShipments$ = this.pageInfo$.pipe(map(info => info.total));

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
        filter(specimens => specimens !== undefined),
        withLatestFrom(this.shipmentToRemove$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([pagedReply, shipment]) => {
        if (pagedReply.entities.length > 0) {
          this.modalService.open(ModalShipmentHasSpecimensComponent);
          return;
        }

        this.modalService
          .open(ModalShipmentRemoveComponent)
          .result.then(() => {
            this.store$.dispatch(ShipmentStoreActions.removeShipmentRequest({ shipment }));
            this.updatedMessage$.next('Shipment removed');
          })
          .catch(() => undefined);
      });

    this.stateFilterInit();
    this.updateShipments();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  stateFilterInit() {
    this.stateFilter = new StateFilter(
      Object.values(ShipmentState)
        .filter(s => s !== ShipmentState.Completed)
        .map(s => ({ id: s, label: s.toUpperCase() })),
      'all',
      true
    );
  }

  sortBy(sortField: string) {
    if (sortField.includes('location')) {
      let field: string;
      if (this.mode === CentreShipmentsViewMode.Outgoing) {
        field = 'toLocationName';
      } else {
        field = 'fromLocationName';
      }
      this.sortField = (sortField.charAt(0) === '-' ? '-' : '') + field;
    }

    this.sortField = sortField;
    this.updateShipments();
  }

  filterByCourierName(value: string) {
    this.courierNameFilter.setValue(value);
    this.updateShipments();
  }

  filterByTrackingNumber(value: string) {
    this.trackingNumberFilter.setValue(value);
    this.updateShipments();
  }

  filterByState(value: string) {
    this.stateFilter.setValue(value === undefined ? 'all' : value);
    this.updateShipments();
  }

  public paginationPageChange(page: number) {
    this.currentPage = page;
    this.updateShipments();
  }

  shipmentView(shipment: Shipment) {
    this.router.navigate(['../view', shipment.id], { relativeTo: this.route });
  }

  shipmentRemoved(shipment: Shipment) {
    if (this.mode === CentreShipmentsViewMode.Completed) {
      throw Error('should never be called when viewing completed shipments');
    }

    if (!shipment.isCreated()) {
      this.modalService.open(ShipmentNotInCreatedModalComponent);
      return;
    }

    this.shipmentToRemove$.next(shipment);
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment,
        searchParams: {}
      })
    );
  }

  protected updateShipments(): void {
    let filter: string;

    switch (this.mode) {
      case CentreShipmentsViewMode.Incoming:
        filter = `toCentre::${this.centre.name}`;
        break;
      case CentreShipmentsViewMode.Outgoing:
        filter = `fromCentre::${this.centre.name}`;
        break;
      case CentreShipmentsViewMode.Completed:
        filter = `toCentre::${this.centre.name};state::completed`;
        break;
    }

    const searchParams = {
      filter,
      sort: this.sortField,
      page: this.currentPage
    };
    this.store$.dispatch(ShipmentStoreActions.searchShipmentsRequest({ searchParams }));
  }

  private determineMode(): CentreShipmentsViewMode {
    return Object.values(CentreShipmentsViewMode).find(viewMode => this.router.url.includes(viewMode));
  }

  private initCheckRemoved() {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastRemovedId),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('The shipment was removed');
        this.updateShipments();
      });
  }
}
