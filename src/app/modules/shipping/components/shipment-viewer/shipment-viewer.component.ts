import { Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { ModalInputOptions } from '@app/modules/modals/models';
import { RootStoreState, ShipmentStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

/**
 * Base class for components that display a shipment.
 */
export class ShipmentViewerComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;
  modalInputOptions: ModalInputOptions = { required: true };

  protected shipment$: Observable<Shipment>;
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(protected store$: Store<RootStoreState.State>) {}

  ngOnInit() {
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
      takeUntil(this.unsubscribe$),
      shareReplay()
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
