import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { Store, select } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { map, takeUntil, withLatestFrom, shareReplay, filter } from 'rxjs/operators';
import { ModalInputOptions } from '@app/modules/modals/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ShipmentStateTransision } from '@app/core/services';
import { ModalShipmentBackToCreatedComponent } from '../../../modals/components/modal-shipment-back-to-created/modal-shipment-back-to-created.component';
import { ModalShipmentBackToPackedComponent } from '@app/modules/modals/components/modal-shipment-back-to-packed/modal-shipment-back-to-packed.component';
import { ModalShipmentTagAsLostComponent } from '@app/modules/modals/components/modal-shipment-tag-as-lost/modal-shipment-tag-as-lost.component';

/**
 * Used to display a shipment in the following states:
 * - packed
 * - sent
 * - received
 * - completed
 */

@Component({
  selector: 'app-shipment-view-page',
  templateUrl: './shipment-view-page.component.html',
  styleUrls: ['./shipment-view-page.component.scss']
})
export class ShipmentViewPageComponent implements OnInit, OnDestroy {
  shipment: Shipment;

  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;
  @ViewChild('receivedTimeModal', { static: false }) receivedTimeModal: TemplateRef<any>;
  @ViewChild('unpackedTimeModal', { static: false }) unpackedTimeModal: TemplateRef<any>;
  sentTimeModalOptions: ModalInputOptions = { required: true };

  receivedTimeModalOptions: ModalInputOptions = { required: true };
  unpackedTimeModalOptions: ModalInputOptions = { required: true };

  private shipment$: Observable<Shipment>;
  private backToCreated$ = new Subject<boolean>();
  private sentTime$ = new Subject<Date>();

  private backToPacked$ = new Subject<boolean>();
  private tagAsReceived$ = new Subject<boolean>();
  private tagAsUnpacked$ = new Subject<boolean>();
  private tagAsLost$ = new Subject<boolean>();
  private receivedTime$ = new Subject<Date>();
  private unpackedTime$ = new Subject<Date>();

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.shipment = this.route.snapshot.data.shipment;

    if (this.shipment.isCreated() || this.shipment.isUnpacked()) {
      this.router.navigateByUrl('/server-error');
      return;
    }

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
      this.shipment = shipment;
    });

    this.setupBackToCreated();
    this.setupTagAsSent();

    this.setupBackToPacked();
    this.setupTagAsReceived();
    this.setupTagAsUnpacked();
    this.setupTagAsLost();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /************ PACKED ****************/

  backToCreated() {
    this.modalService
      .open(ModalShipmentBackToCreatedComponent)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Created
            }
          })
        );
        this.backToCreated$.next(true);
      })
      .catch(() => undefined);
  }

  tagAsSent() {
    this.modalService
      .open(this.sentTimeModal, { size: 'lg' })
      .result.then((datetime: Date) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Sent,
              datetime
            }
          })
        );
        this.sentTime$.next(datetime);
      })
      .catch(() => undefined);
  }

  /************ SENT ****************/

  backToPacked() {
    this.modalService
      .open(ModalShipmentBackToPackedComponent)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Packed,
              datetime: this.shipment.timePacked
            }
          })
        );
        this.backToPacked$.next(true);
      })
      .catch(() => undefined);
  }

  tagAsReceived() {
    this.modalService
      .open(this.receivedTimeModal, { size: 'lg' })
      .result.then((datetime: Date) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Received,
              datetime
            }
          })
        );
        this.receivedTime$.next(datetime);
      })
      .catch(() => undefined);
  }

  tagAsUnpacked() {
    this.modalService
      .open(this.unpackedTimeModal, { size: 'lg' })
      .result.then(([receivedTime, unpackedTime]) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.SkipToUnpacked,
              datetime: receivedTime,
              skipDatetime: unpackedTime
            }
          })
        );
        this.unpackedTime$.next(unpackedTime);
      })
      .catch(() => undefined);
  }

  tagAsLost() {
    this.modalService
      .open(ModalShipmentTagAsLostComponent)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Lost
            }
          })
        );
        this.tagAsLost$.next(true);
      })
      .catch(() => undefined);
  }

  /************ PACKED ****************/

  private setupBackToCreated(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToCreated$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, _flag]) => {
        if (!shipment.isCreated()) {
          throw new Error('shipment is not in created state');
        }
        this.router.navigate(['/shipping/add-items', shipment.id]);
      });
  }

  private setupTagAsSent(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.sentTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, message]) => {
        this.toastr.success('Sent time recorded');
        this.router.navigate(['/shipping/view', shipment.id]);
      });
  }

  /************ SENT ****************/

  private setupBackToPacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToPacked$),
        takeUntil(this.unsubscribe$),
        filter(([_shipment, flag]) => flag !== undefined)
      )
      .subscribe(() => {
        this.toastr.success('Tagged as packed');
        this.backToPacked$.next(undefined);
      });
  }

  private setupTagAsReceived(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.receivedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Received time recorded');
        this.receivedTime$.next(undefined);
      });
  }

  private setupTagAsUnpacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.unpackedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, message]) => {
        this.toastr.success('Received time and unpacked time recorded');
        this.router.navigate(['/shipping/view', shipment.id]);
      });
  }

  private setupTagAsLost(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.tagAsLost$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, _flag]) => {
        if (!shipment.isSent()) {
          throw new Error('shipment is not in sent state');
        }
      });
  }
}
