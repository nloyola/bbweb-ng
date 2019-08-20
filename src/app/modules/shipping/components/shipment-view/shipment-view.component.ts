import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-view',
  templateUrl: './shipment-view.component.html',
  styleUrls: ['./shipment-view.component.scss']
})
export class ShipmentViewComponent implements OnInit {
  shipment: Shipment;

  protected shipment$: Observable<Shipment>;
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.shipment = this.route.snapshot.data.shipment;

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

    this.shipment$.pipe(takeUntil(this.unsubscribe$)).subscribe(shipment => {
      if (shipment === undefined) {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
      this.shipment = shipment;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
