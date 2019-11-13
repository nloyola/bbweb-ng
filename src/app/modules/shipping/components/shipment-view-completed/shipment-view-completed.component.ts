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
  selector: 'app-shipment-view-completed',
  templateUrl: './shipment-view-completed.component.html',
  styleUrls: ['./shipment-view-completed.component.scss']
})
export class ShipmentViewCompletedComponent extends ShipmentViewer {
  @ViewChild('backToUnpackedModal', { static: false }) backToUnpackedModal: TemplateRef<any>;

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    toastr: ToastrService,
    modalService: NgbModal,
    blockingProgressService: BlockingProgressService
  ) {
    super(store$, route, toastr, modalService, blockingProgressService);
  }

  backToUnpacked() {
    this.modalService
      .open(this.backToUnpackedModal)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Unpacked,
              datetime: this.shipment.timeUnpacked
            }
          })
        );
        this.notificationMessage = 'Tagged as Unpacked';
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }
}
