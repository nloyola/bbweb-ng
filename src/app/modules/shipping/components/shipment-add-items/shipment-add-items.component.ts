import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { ModalInputOptions } from '@app/modules/modals/models';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentStoreActions,
  ShipmentStoreSelectors,
  ShipmentSpecimenStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentStateTransision } from '../../../../core/services/shipment.service';
import { ModalShipmentHasNoSpecimensComponent } from '../modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentSpecimenAction } from '../shipment-specimens-table/shipment-specimens-table.container';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';

@Component({
  selector: 'app-shipment-add-items',
  templateUrl: './shipment-add-items.component.html',
  styleUrls: ['./shipment-add-items.component.scss']
})
export class ShipmentAddItemsComponent extends ShipmentViewerComponent {
  @ViewChild('packedTimeModal', { static: false }) packedTimeModal: TemplateRef<any>;
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;
  @ViewChild('removeShipmentSpecimenModal', { static: false }) removeShipmentSpecimenModal: TemplateRef<any>;
  @ViewChild('addSpecimenError', { static: false }) addSpecimenError: TemplateRef<any>;

  @Input() shipment: Shipment;

  packedTimeModalOptions: ModalInputOptions = { required: true };
  sentTimeModalOptions: ModalInputOptions = { required: true };
  shipmentSpecimenToRemove: ShipmentSpecimen;
  actions: ShipmentSpecimenAction[] = [
    {
      id: 'remove',
      label: 'Remove Specimen',
      icon: 'remove_circle',
      iconClass: 'danger-icon'
    }
  ];
  addErrorMessage = '';

  private notificationMessage$ = new Subject<string>();

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
    this.initOnRemoved();
    this.initOnShipmentModified();
    this.initOnSpecimenRemoved();
    this.initShipmentErrorSelector();
    this.initShipmentSpecimenErrorSelector();
  }

  removeShipment() {
    if (this.shipment.specimenCount > 0) {
      this.modalService.open(ModalShipmentHasSpecimensComponent, { size: 'lg' });
      return;
    }

    this.modalService
      .open(ModalShipmentRemoveComponent)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.removeShipmentRequest({
            shipment: this.shipment
          })
        );
        this.blockingProgressService.show('Removing Shipment...');
        this.notificationMessage$.next('Shipment removed');
      })
      .catch(() => undefined);
  }

  tagAsPacked() {
    if (this.shipment.specimenCount <= 0) {
      const modalRef = this.modalService.open(ModalShipmentHasNoSpecimensComponent, { size: 'lg' });
      modalRef.componentInstance.transition = ShipmentStateTransision.Packed;
      return;
    }

    this.modalService
      .open(this.packedTimeModal, { size: 'lg' })
      .result.then((datetime: Date) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Packed,
              datetime
            }
          })
        );
        this.notificationMessage$.next('Packed time recorded');
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }

  tagAsSent() {
    if (this.shipment.specimenCount <= 0) {
      const modalRef = this.modalService.open(ModalShipmentHasNoSpecimensComponent, { size: 'lg' });
      modalRef.componentInstance.transition = ShipmentStateTransision.SkipToSent;
      return;
    }

    this.modalService
      .open(this.sentTimeModal, { size: 'lg' })
      .result.then(([packedTime, sentTime]) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.SkipToSent,
              datetime: packedTime,
              skipDatetime: sentTime
            }
          })
        );
        this.notificationMessage$.next('Packed and Sent time recorded');
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }

  // event emitted by ShipmentInformationCardComponent
  shipmentChange(changeOngoing: boolean): void {
    if (changeOngoing) {
      this.blockingProgressService.show('Updating Shipment...');
    } else {
      this.blockingProgressService.hide();
    }
  }

  addShipmentSpecimens(specimenInventoryIds: string[]): void {
    this.store$.dispatch(
      ShipmentStoreActions.addSpecimensRequest({
        shipment: this.shipment,
        specimenInventoryIds
      })
    );
    this.notificationMessage$.next('Specimen Added');
    this.blockingProgressService.show('Adding Specimen...');
  }

  shipmentSpecimenAction([shipmentSpecimen, actionId]) {
    switch (actionId) {
      case 'remove':
        this.removeShipmentSpecimen(shipmentSpecimen);
        break;
      default:
        throw new Error(`action ${actionId} is not handled`);
    }
  }

  private initOnShipmentModified(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.notificationMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_shipment, message]) => {
        this.toastr.success(message);
        this.notificationMessage$.next(undefined);
        this.blockingProgressService.hide();
      });
  }

  private initOnRemoved(): void {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastRemovedId),
        withLatestFrom(this.notificationMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.blockingProgressService.hide();
      });
  }

  private initOnSpecimenRemoved(): void {
    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenLastRemovedId),
        withLatestFrom(this.notificationMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_id, message]) => {
        this.blockingProgressService.hide();
        this.toastr.success(message);
      });
  }

  private initShipmentErrorSelector() {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(s => !!s),
        withLatestFrom(this.notificationMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        if (
          error.actionType === ShipmentStoreActions.removeShipmentFailure.type &&
          error.error instanceof HttpErrorResponse
        ) {
          let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
          this.toastr.error(errMessage, 'Error', { disableTimeOut: true });
        }
      });
  }

  private initShipmentSpecimenErrorSelector(): void {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(error => !!error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        if (
          error.actionType === ShipmentStoreActions.addSpecimensFailure.type &&
          error.error instanceof HttpErrorResponse
        ) {
          const errorMessage = error.error.error.message;
          const inventoryIds = errorMessage.split(': ');

          if (errorMessage.match(/invalid specimen inventory IDs/)) {
            this.addErrorMessage = `Inventory IDs not present in the system:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/specimens are already in an active shipment/)) {
            this.addErrorMessage = `Inventory IDs already in this shipment or another shipment:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/invalid centre for specimen inventory IDs/)) {
            this.addErrorMessage = `Inventory IDs at a different location than where shipment is coming from:<br><b>${inventoryIds[2]}</b>`;
          } else {
            this.addErrorMessage = errorMessage;
          }

          this.modalService.open(this.addSpecimenError, { size: 'lg' });
          this.blockingProgressService.hide();
        }
      });
  }

  private removeShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    this.shipmentSpecimenToRemove = shipmentSpecimen;
    const modal = this.modalService.open(this.removeShipmentSpecimenModal, { size: 'lg' });
    modal.result
      .then(() => {
        this.store$.dispatch(
          ShipmentSpecimenStoreActions.removeShipmentSpecimenRequest({ shipmentSpecimen })
        );
        this.blockingProgressService.show('Removing Specimen...');
        this.notificationMessage$.next('Specimen Removed');
        this.blockingProgressService.hide();
      })
      .catch(() => undefined);
  }
}
