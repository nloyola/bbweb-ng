import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { Subject } from 'rxjs';
import { ShipmentStateTransision } from '@app/core/services';

@Component({
  selector: 'app-shipment-view-completed',
  templateUrl: './shipment-view-completed.component.html',
  styleUrls: ['./shipment-view-completed.component.scss']
})
export class ShipmentViewCompletedComponent extends ShipmentViewerComponent {
  @ViewChild('backToUnpackedModal', { static: false }) backToUnpackedModal: TemplateRef<any>;

  private backToUnpacked$ = new Subject<boolean>();

  constructor(
    store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
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
        this.backToUnpacked$.next(true);
      })
      .catch(() => undefined);
  }
}
