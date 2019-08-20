import { OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PagedReplyInfo } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { StateFilter } from '@app/domain/search-filters';
import { CourierNameFilter } from '@app/domain/search-filters/courier-name-filter.model';
import { TrackingNumberFilter } from '@app/domain/search-filters/tracking-number-filter.model';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreActions,
  ShipmentStoreSelectors,
  ShipmentSpecimenStoreActions
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ShipmentNotInCreatedModalComponent } from '@app/modules/modals/components/shipment-not-in-created-modal/shipment-not-in-created-modal.component';
import { ShipmentRemoveModalComponent } from '@app/modules/modals/components/shipment-remove-modal/shipment-remove-modal.component';
import { ModalShipmentHasSpecimensComponent } from '@app/modules/modals/components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';

export abstract class CentreShipmentsBaseComponent implements OnInit, OnDestroy {
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

  private shipmentToRemove$ = new Subject<Shipment>();
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    protected store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.centre = this.route.parent.snapshot.data.centre;

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities),
      filter(x => x !== undefined),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

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
          .open(ShipmentRemoveModalComponent)
          .result.then(() => {
            this.store$.dispatch(ShipmentStoreActions.removeShipmentRequest({ shipment }));
            this.updatedMessage$.next('Shipment removed');
          })
          .catch(() => undefined);
      });

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

  protected abstract updateFilters(): string;

  shipmentView(shipment: Shipment) {
    if (shipment.state === ShipmentState.Created) {
      this.router.navigate(['/shipping/add-items', shipment.id]);
    } else {
      this.router.navigate(['/shipping/view', shipment.id]);
    }
  }

  shipmentRemoved(shipment: Shipment) {
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
    const searchParams = {
      filter: this.updateFilters(),
      sort: this.sortField,
      page: this.currentPage
    };
    this.store$.dispatch(ShipmentStoreActions.searchShipmentsRequest({ searchParams }));
  }
}
