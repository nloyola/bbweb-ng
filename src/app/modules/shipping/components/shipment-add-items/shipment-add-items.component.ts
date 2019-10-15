import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalInputOptions } from '@app/modules/modals/models';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentStoreActions,
  ShipmentStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { takeUntil, withLatestFrom, filter, tap } from 'rxjs/operators';
import { ShipmentStateTransision } from '../../../../core/services/shipment.service';
import { ModalShipmentHasNoSpecimensComponent } from '../modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { Shipment } from '@app/domain/shipments';

@Component({
  selector: 'app-shipment-add-items',
  templateUrl: './shipment-add-items.component.html',
  styleUrls: ['./shipment-add-items.component.scss']
})
export class ShipmentAddItemsComponent extends ShipmentViewerComponent {
  @ViewChild('packedTimeModal', { static: false }) packedTimeModal: TemplateRef<any>;
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;

  @Input() shipment: Shipment;

  packedTimeModalOptions: ModalInputOptions = { required: true };
  sentTimeModalOptions: ModalInputOptions = { required: true };
  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  sortField = '';
  currentPage = 1;

  private updatedMessage$ = new Subject<string>();
  private packedTime$ = new Subject<Date>();
  private sentTime$ = new Subject<Date>();

  constructor(
    store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initOnRemoved();
    this.initOnShipmentModified();
    this.initErrorSelector();
  }

  sortBy(sortField: string) {
    this.sortField = sortField;
    this.updateSpecimens();
  }

  paginationPageChange(page: number) {
    this.currentPage = page;
    this.updateSpecimens();
  }

  updateSpecimens(): void {
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {
          sort: this.sortField,
          page: this.currentPage
        }
      })
    );
  }

  remove() {
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
        this.updatedMessage$.next('Shipment removed');
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
        this.updatedMessage$.next('Packed time recorded');
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
        this.updatedMessage$.next('Packed and Sent time recorded');
      })
      .catch(() => undefined);
  }

  private initOnShipmentModified(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_shipment, message]) => {
        this.toastr.success(message);
      });
  }

  private initOnRemoved(): void {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastRemovedId),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('The shipment was removed');
      });
  }

  private initErrorSelector() {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(s => !!s),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        this.toastr.error(errMessage, 'Error', { disableTimeOut: true });
      });
  }
}
