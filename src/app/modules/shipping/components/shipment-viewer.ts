import { OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { Shipment } from '@app/domain/shipments';
import { ModalInputOptions } from '@app/modules/modals/models';
import { RootStoreState, ShipmentStoreSelectors } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

/**
 * Base class for components that display a shipment.
 */
export class ShipmentViewer implements OnInit, OnDestroy {
  shipment: Shipment;
  modalInputOptions: ModalInputOptions = { required: true };
  notificationMessage: string = undefined;

  protected shipment$: Observable<Shipment>;
  protected error$: Observable<any>;
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    protected store$: Store<RootStoreState.State>,
    protected route: ActivatedRoute,
    protected toastr: ToastrService,
    protected modalService: NgbModal,
    protected blockingProgressService: BlockingProgressService
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
      filter(shipment => shipment !== undefined),
      tap(shipment => {
        this.shipment = shipment;
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.error$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectShipmentError),
      filter(error => error !== null),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipment$.pipe(filter(() => this.notificationMessage !== undefined)).subscribe(() => {
      this.toastr.success(this.notificationMessage);
      this.notificationMessage = undefined;
      this.blockingProgressService.hide();
    });

    this.initShipmentErrorSelector();
  }

  protected initShipmentErrorSelector() {
    this.error$.pipe(filter(() => this.notificationMessage !== undefined)).subscribe(error => {
      let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      this.toastr.error(errMessage, 'Error', { disableTimeOut: true });
      this.notificationMessage = undefined;
      this.blockingProgressService.hide();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
