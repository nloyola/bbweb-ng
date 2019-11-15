import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { ModalInputOptions } from '@app/modules/modals/models';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { filter, takeUntil } from 'rxjs/operators';
import { ShipmentStateTransision } from '../../../../core/services/shipment.service';
import { ModalShipmentHasNoSpecimensComponent } from '../modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentSpecimenAction } from '../shipment-specimens-table/shipment-specimens-table.container';
import { ShipmentViewer } from '../shipment-viewer';
import { NotificationService } from '@app/core/services';

@Component({
  selector: 'app-shipment-add-items',
  templateUrl: './shipment-add-items.component.html',
  styleUrls: ['./shipment-add-items.component.scss']
})
export class ShipmentAddItemsComponent extends ShipmentViewer {
  @ViewChild('packedTimeModal', { static: false }) packedTimeModal: TemplateRef<any>;
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;
  @ViewChild('removeShipmentSpecimenModal', { static: false }) removeShipmentSpecimenModal: TemplateRef<any>;
  @ViewChild('addSpecimenError', { static: false }) addSpecimenError: TemplateRef<any>;

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

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    notificationService: NotificationService,
    modalService: NgbModal,
    blockingProgressService: BlockingProgressService
  ) {
    super(store$, route, notificationService, modalService, blockingProgressService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initOnRemoved();
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
        this.notificationService.add('Shipment removed');
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
        this.notificationService.add('Packed time recorded');
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
        this.notificationService.add('Packed and Sent time recorded');
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
    this.notificationService.add('Specimen Added');
    this.blockingProgressService.show('Adding Specimen...');
  }

  shipmentSpecimenEvent([shipmentSpecimen, eventId]) {
    switch (eventId) {
      case 'remove':
        this.removeShipmentSpecimen(shipmentSpecimen);
        break;
      default:
        throw new Error(`event ${eventId} is invalid`);
    }
  }

  private initOnRemoved(): void {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastRemovedId),
        filter(() => this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.notificationService.show();
        this.blockingProgressService.hide();
      });
  }

  protected initShipmentErrorSelector() {
    this.error$.subscribe(error => {
      debugger;
      if (
        error.actionType === ShipmentStoreActions.addSpecimensFailure.type ||
        error.actionType === ShipmentStoreActions.removeSpecimenFailure.type
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
        return;
      }

      super.initShipmentErrorSelector();
    });
  }

  private removeShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    this.shipmentSpecimenToRemove = shipmentSpecimen;
    const modal = this.modalService.open(this.removeShipmentSpecimenModal, { size: 'lg' });
    modal.result
      .then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.removeSpecimenRequest({
            shipment: this.shipment,
            shipmentSpecimen
          })
        );
        this.notificationService.add('Specimen Removed');
        this.blockingProgressService.show('Removing Specimen...');
      })
      .catch(() => undefined);
  }
}
