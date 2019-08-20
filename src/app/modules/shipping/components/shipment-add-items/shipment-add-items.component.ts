import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { ModalInputOptions } from '@app/modules/modals/models';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreActions,
  ShipmentStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { ShipmentStateTransision } from '../../../../core/services/shipment.service';
import { ModalShipmentHasNoSpecimensComponent } from '../modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { ModalShipmentHasSpecimensComponent } from '../modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentRemoveComponent } from '../modal-shipment-remove/modal-shipment-remove.component';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';

@Component({
  selector: 'app-shipment-add-items',
  templateUrl: './shipment-add-items.component.html',
  styleUrls: ['./shipment-add-items.component.scss']
})
export class ShipmentAddItemsComponent extends ShipmentViewerComponent implements OnInit, OnDestroy {
  @ViewChild('packedTimeModal', { static: false }) packedTimeModal: TemplateRef<any>;
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;

  packedTimeModalOptions: ModalInputOptions = { required: true };
  sentTimeModalOptions: ModalInputOptions = { required: true };

  private updatedMessage$ = new Subject<string>();
  private packedTime$ = new Subject<Date>();
  private sentTime$ = new Subject<Date>();

  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;

  sortField: string;
  currentPage: number;

  constructor(
    store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initRemove();
    this.initTagAsPacked();
    this.initTagAsSent();
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
    const searchParams = {
      sort: this.sortField,
      page: this.currentPage
    };
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({ shipment: this.shipment, searchParams })
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
        this.packedTime$.next(datetime);
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
        this.sentTime$.next(sentTime);
      })
      .catch(() => undefined);
  }

  private initRemove(): void {
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

  private initTagAsPacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.packedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Packed time recorded');
      });
  }

  private initTagAsSent(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.sentTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Packed time and sent time recorded');
      });
  }

  private queryForSpecimens() {
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {}
      })
    );
  }
}
