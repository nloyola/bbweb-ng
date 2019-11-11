import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';

@Component({
  selector: 'app-shipment-view-packed',
  templateUrl: './shipment-view-packed.component.html',
  styleUrls: ['./shipment-view-packed.component.scss']
})
export class ShipmentViewPackedComponent extends ShipmentViewerComponent {
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;
  @ViewChild('backToCreatedModal', { static: false }) backToCreatedModal: TemplateRef<any>;

  private backToCreated$ = new Subject<boolean>();
  private sentTime$ = new Subject<Date>();

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
    this.initBackToCreated();
    this.initTagAsSent();
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
        this.backToCreated$.next(true);
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
        this.sentTime$.next(datetime);
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }

  private initBackToCreated(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToCreated$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Shipment back in Created state');
        this.blockingProgressService.hide();
      });
  }

  private initTagAsSent(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.sentTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Sent time recorded');
        this.blockingProgressService.hide();
      });
  }
}
