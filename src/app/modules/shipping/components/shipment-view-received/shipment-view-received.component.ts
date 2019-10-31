import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';

@Component({
  selector: 'app-shipment-view-received',
  templateUrl: './shipment-view-received.component.html',
  styleUrls: ['./shipment-view-received.component.scss']
})
export class ShipmentViewReceivedComponent extends ShipmentViewerComponent {
  @ViewChild('unpackedTimeModal', { static: false }) unpackedTimeModal: TemplateRef<any>;
  @ViewChild('backToSentModal', { static: false }) backToSentModal: TemplateRef<any>;

  private backToSent$ = new Subject<boolean>();
  private unpackedTime$ = new Subject<Date>();

  constructor(
    store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initBackToSent();
    this.initTagAsUnpacked();
  }

  backToSent() {
    this.modalService
      .open(this.backToSentModal)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Sent,
              datetime: this.shipment.timeSent
            }
          })
        );
        this.backToSent$.next(true);
      })
      .catch(() => undefined);
  }

  tagAsUnpacked() {
    this.modalService
      .open(this.unpackedTimeModal, { size: 'lg' })
      .result.then(unpackedTime => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Unpacked,
              datetime: unpackedTime
            }
          })
        );
        this.unpackedTime$.next(unpackedTime);
      })
      .catch(() => undefined);
  }

  private initBackToSent(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToSent$),
        takeUntil(this.unsubscribe$),
        filter(([_shipment, flag]) => flag !== undefined)
      )
      .subscribe(() => {
        this.toastr.success('Tagged as Sent');
      });
  }

  private initTagAsUnpacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.unpackedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Received time recorded');
      });
  }
}
