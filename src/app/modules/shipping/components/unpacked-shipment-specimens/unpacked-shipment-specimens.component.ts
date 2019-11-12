import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateFilter } from '@app/domain/search-filters';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

/**
 * Base class used for unpacking shipments.
 */
export abstract class UnpackedShipmentSpeciemensComponent implements OnInit, OnDestroy {
  shipment: Shipment;
  specimenFilter = new StateFilter(Object.values(ShipmentItemState), ShipmentItemState.Received, false);
  specimenCount: number;
  shipment$: Observable<Shipment>;
  shipmentLoading$ = new BehaviorSubject<boolean>(false);

  protected tagPending$ = new Subject<boolean>();
  protected error$: Observable<string>;
  protected unsubscribe$ = new Subject<void>();

  constructor(protected store$: Store<RootStoreState.State>, protected route: ActivatedRoute) {}

  ngOnInit() {
    this.shipment = this.route.parent.snapshot.data.shipment;
    this.specimenCount = this.shipment.presentSpecimenCount;

    this.error$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentError),
      filter(error => !!error),
      withLatestFrom(this.tagPending$),
      filter(([_error, tagPending]) => tagPending !== undefined),
      map(([error, _tagPending]) => {
        if (error.actionType === ShipmentStoreActions.tagSpecimensFailure.type) {
          const errorMessage = error.error.error.message;
          const inventoryIds = errorMessage.split(': ');

          if (errorMessage.match(/invalid inventory Ids/)) {
            return `Inventory IDs not present in the system:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/specimens not in this shipment/)) {
            return `Inventory IDs not present in this shipment:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/shipment specimens not present/)) {
            return `Inventory IDs have already been unpacked:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/specimen inventory IDs already in this shipment/)) {
            return `Inventory IDs are already in this shipment:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/specimens are already in an active shipment/)) {
            return `Inventory IDs are part of another shipment:<br><b>${inventoryIds[2]}</b>`;
          } else {
            return errorMessage;
          }
        }
        return JSON.stringify(error);
      }),
      tap(() => {
        this.shipmentLoading$.next(false);
      }),
      takeUntil(this.unsubscribe$)
    );

    this.shipment$ = this.store$.pipe(
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
      tap(shipment => {
        if (shipment !== undefined) {
          this.shipmentLoading$.next(false);
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  protected tagSpecimen(shipmentSpecimen: ShipmentSpecimen, specimenTag: ShipmentItemState): void {
    this.store$.dispatch(
      ShipmentStoreActions.tagSpecimensRequest({
        shipment: this.shipment,
        specimenInventoryIds: [shipmentSpecimen.specimen.inventoryId],
        specimenTag
      })
    );
    this.shipmentLoading$.next(true);
  }

  protected markTagPending(): void {
    this.tagPending$.next(true);
  }
}
