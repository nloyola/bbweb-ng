import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShipmentStateTransision } from '@app/core/services';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { ShipmentViewer } from '../shipment-viewer';

@Component({
  selector: 'app-shipment-view-sent',
  templateUrl: './shipment-view-sent.component.html',
  styleUrls: ['./shipment-view-sent.component.scss']
})
export class ShipmentViewSentComponent extends ShipmentViewer {
  @ViewChild('receivedTimeModal', { static: false }) receivedTimeModal: TemplateRef<any>;
  @ViewChild('unpackedTimeModal', { static: false }) unpackedTimeModal: TemplateRef<any>;
  @ViewChild('backToPackedModal', { static: false }) backToPackedModal: TemplateRef<any>;
  @ViewChild('tagAsLostModal', { static: false }) tagAsLostModal: TemplateRef<any>;

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    toastr: ToastrService,
    modalService: NgbModal,
    blockingProgressService: BlockingProgressService
  ) {
    super(store$, route, toastr, modalService, blockingProgressService);
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
        this.notificationMessage = 'Tagged as Packed';
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationMessage = 'Received time recorded';
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationMessage = 'Received time and unpacked time recorded';
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationMessage = 'Tagged as Lost';
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }
}
