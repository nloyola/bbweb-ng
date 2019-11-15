import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockingProgressService, NotificationService, ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ShipmentViewer } from '../shipment-viewer';

@Component({
  selector: 'app-shipment-view-received',
  templateUrl: './shipment-view-received.component.html',
  styleUrls: ['./shipment-view-received.component.scss']
})
export class ShipmentViewReceivedComponent extends ShipmentViewer {
  @ViewChild('unpackedTimeModal', { static: false }) unpackedTimeModal: TemplateRef<any>;
  @ViewChild('backToSentModal', { static: false }) backToSentModal: TemplateRef<any>;

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    notificationService: NotificationService,
    modalService: NgbModal,
    blockingProgressService: BlockingProgressService
  ) {
    super(store$, route, notificationService, modalService, blockingProgressService);
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

        this.notificationService.add('Tagged as Sent');
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationService.add('Received time recorded');
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }
}
