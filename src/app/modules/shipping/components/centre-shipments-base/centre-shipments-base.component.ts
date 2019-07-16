import { OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { StateFilter } from '@app/domain/search-filters';
import { CourierNameFilter } from '@app/domain/search-filters/courier-name-filter.model';
import { TrackingNumberFilter } from '@app/domain/search-filters/tracking-number-filter.model';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreSelectors, ShipmentStoreActions } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

export abstract class CentreShipmentsBaseComponent implements OnInit, OnDestroy {
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

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(protected store$: Store<RootStoreState.State>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.centre = this.route.parent.snapshot.data.centre;

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentSearchRepliesAndEntities),
      filter(x => x !== undefined),
      shareReplay()
    );

    this.shipments$ = this.pageInfo$.pipe(map(info => info.entities));
    this.maxPages$ = this.pageInfo$.pipe(map(info => info.maxPages));
    this.totalShipments$ = this.pageInfo$.pipe(map(info => info.total));
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

  protected updateShipments(): void {
    const filters = this.updateFilters();
    this.store$.dispatch(
      ShipmentStoreActions.searchShipmentsRequest({
        searchParams: new SearchParams(filters, this.sortField, this.currentPage)
      })
    );
  }
}

// map((shipments: Shipment[]) => shipments.filter(s => s.fromLocationInfo.centreId === centre.id))

// map(shipments => shipments.filter(s => s.state === ShipmentState.Completed));
