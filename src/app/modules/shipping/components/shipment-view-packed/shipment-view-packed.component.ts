import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShipmentStateTransision, NotificationService } from '@app/core/services';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { ShipmentViewer } from '../shipment-viewer';

@Component({
  selector: 'app-shipment-view-packed',
  templateUrl: './shipment-view-packed.component.html',
  styleUrls: ['./shipment-view-packed.component.scss']
})
export class ShipmentViewPackedComponent extends ShipmentViewer {
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;
  @ViewChild('backToCreatedModal', { static: false }) backToCreatedModal: TemplateRef<any>;

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    notificationService: NotificationService,
    modalService: NgbModal,
    blockingProgressService: BlockingProgressService
  ) {
    super(store$, route, notificationService, modalService, blockingProgressService);
  }

  backToCreated() {
    this.modalService
      .open(this.backToCreatedModal)
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
        this.notificationService.add('Shipment back in Created state');
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationService.add('Sent time recorded');
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }
}
