import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedReplyInfo } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { StateFilter } from '@app/domain/search-filters';
import { CourierNameFilter } from '@app/domain/search-filters/courier-name-filter.model';
import { TrackingNumberFilter } from '@app/domain/search-filters/tracking-number-filter.model';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';

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
  isLoading$ = new BehaviorSubject<boolean>(true);

  sortField: string;
  currentPage: number = 1;
  courierNameFilter = new CourierNameFilter();
  trackingNumberFilter = new TrackingNumberFilter();
  stateFilter: StateFilter;
  mode: CentreShipmentsViewMode;

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

    this.initCheckShipmentRemoved();

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipments$ = this.pageInfo$.pipe(
      tap(info => {
        if (info !== undefined) {
          this.isLoading$.next(false);
        }
      }),
      map(info => {
        if (info === undefined) {
          return [];
        }
        return info.entities
          .filter((s: any) => s !== undefined)
          .map((s: any) => (s instanceof Shipment ? s : new Shipment().deserialize(s)));
      })
    );

    this.maxPages$ = this.pageInfo$.pipe(map(info => (info ? info.maxPages : 0)));
    this.totalShipments$ = this.pageInfo$.pipe(map(info => (info ? info.total : 0)));

    this.stateFilterInit();
    this.updateShipments();
    this.initErrorSelector();
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
        field = 'destination';
      } else {
        field = 'origin';
      }
      this.sortField = (sortField.charAt(0) === '-' ? '-' : '') + field;
    } else {
      this.sortField = sortField;
    }
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

  shipmentRemove(shipment: Shipment) {
    if (this.mode === CentreShipmentsViewMode.Completed) {
      throw Error('should never be called when viewing completed shipments');
    }

    if (!shipment.isCreated()) {
      throw Error('should never be called for a shipment not in CREATED state');
    }

    if (shipment.hasSpecimens()) {
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
  }

  protected updateShipments(): void {
    const filters: string[] = [];

    switch (this.mode) {
      case CentreShipmentsViewMode.Incoming:
        filters.push('state:out:completed', `destination::${this.centre.name}`);
        break;
      case CentreShipmentsViewMode.Outgoing:
        filters.push('state:out:completed', `origin::${this.centre.name}`);
        break;
      case CentreShipmentsViewMode.Completed:
        filters.push('state::completed', `destination::${this.centre.name}`);
        break;
      default:
        throw new Error(`invalid component mode: ${this.mode}`);
    }

    filters.push(this.courierNameFilter.getValue());
    filters.push(this.trackingNumberFilter.getValue());
    filters.push(this.stateFilter.getValue());

    const searchParams = {
      filter: filters.filter(f => f.length > 0).join(';'),
      sort: this.sortField ? this.sortField : '',
      page: this.currentPage
    };
    this.store$.dispatch(ShipmentStoreActions.searchShipmentsRequest({ searchParams }));
    this.isLoading$.next(true);
  }

  private determineMode(): CentreShipmentsViewMode {
    return this.route.parent.snapshot.data.mode;
  }

  // When a shipment is removed, the search results should be reloaded so the removed shipment does not show
  // up
  private initCheckShipmentRemoved() {
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

  private initErrorSelector() {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(s => !!s),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        this.toastr.error(errMessage, 'Error', { disableTimeOut: true });
      });
  }
}
