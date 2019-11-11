import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';

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
    private modalService: NgbModal,
    private toastr: ToastrService,
    private blockingProgressService: BlockingProgressService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initBackToUnpacked();
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
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }

  private initBackToUnpacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToUnpacked$),
        takeUntil(this.unsubscribe$),
        filter(([_shipment, flag]) => flag !== undefined)
      )
      .subscribe(() => {
        this.toastr.success('Tagged as Unpacked');
        this.blockingProgressService.hide();
      });
  }
}
