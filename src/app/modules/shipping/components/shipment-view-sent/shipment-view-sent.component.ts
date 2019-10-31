import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';

@Component({
  selector: 'app-shipment-view-sent',
  templateUrl: './shipment-view-sent.component.html',
  styleUrls: ['./shipment-view-sent.component.scss']
})
export class ShipmentViewSentComponent extends ShipmentViewerComponent {
  @ViewChild('receivedTimeModal', { static: false }) receivedTimeModal: TemplateRef<any>;
  @ViewChild('unpackedTimeModal', { static: false }) unpackedTimeModal: TemplateRef<any>;
  @ViewChild('backToPackedModal', { static: false }) backToPackedModal: TemplateRef<any>;
  @ViewChild('tagAsLostModal', { static: false }) tagAsLostModal: TemplateRef<any>;

  private backToPacked$ = new Subject<boolean>();
  private receivedTime$ = new Subject<Date>();
  private unpackedTime$ = new Subject<Date>();
  private tagAsLost$ = new Subject<boolean>();

  constructor(
    store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initBackToPacked();
    this.initTagAsReceived();
    this.initTagAsUnpacked();
    this.initTagAsLost();
  }

  backToPacked() {
    this.modalService
      .open(this.backToPackedModal)
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
      .open(this.tagAsLostModal)
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

  private initBackToPacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToPacked$),
        takeUntil(this.unsubscribe$),
        filter(([_shipment, flag]) => flag !== undefined)
      )
      .subscribe(() => {
        this.toastr.success('Tagged as packed');
      });
  }

  private initTagAsReceived(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.receivedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Received time recorded');
      });
  }

  private initTagAsUnpacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.unpackedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Received time and unpacked time recorded');
      });
  }

  private initTagAsLost(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.tagAsLost$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Shipment recorded as lost');
      });
  }
}
