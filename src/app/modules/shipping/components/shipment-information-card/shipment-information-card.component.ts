import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  OnDestroy,
  Output
} from '@angular/core';
import { Shipment } from '@app/domain/shipments';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { Store, select } from '@ngrx/store';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { Subject, Observable } from 'rxjs';
import { map, shareReplay, tap, withLatestFrom, takeUntil, filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shipment-information-card',
  templateUrl: './shipment-information-card.component.html',
  styleUrls: ['./shipment-information-card.component.scss']
})
export class ShipmentInformationCardComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;
  @Input() displayState: boolean;

  @Output() onRemove = new EventEmitter<Shipment>();

  @ViewChild('updateCourierModal', { static: false }) updateCourierModal: TemplateRef<any>;
  @ViewChild('updateTrackingNumberModal', { static: false }) updateTrackingNumberModal: TemplateRef<any>;
  @ViewChild('updateFromLocationModal', { static: false }) updateFromLocationModal: TemplateRef<any>;
  @ViewChild('updateToLocationModal', { static: false }) updateToLocationModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  shipment$: Observable<Shipment>;
  isCardCollapsed: boolean;
  updateCourierModalOptions: ModalInputTextOptions;
  updateTrackingNumberModalOptions: ModalInputTextOptions;
  updateFromLocationInfoModalOptions: ModalInputTextOptions;
  updateToLocationInfoModalOptions: ModalInputTextOptions;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.shipment$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectAllShipmentEntities),
      map(shipments => {
        const shipmentEntity = shipments[this.shipment.id];
        if (shipmentEntity) {
          return shipmentEntity instanceof Shipment
            ? shipmentEntity
            : new Shipment().deserialize(shipmentEntity);
        }
        return undefined;
      }),
      filter(shipment => shipment !== undefined),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipment$.pipe(takeUntil(this.unsubscribe$)).subscribe(shipment => {
      this.shipment = shipment;
    });

    this.shipment$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_shipment, msg]) => {
        this.toastr.success(msg, 'Update Successfull');
        this.updatedMessage$.next(null);
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateCourier() {
    this.updateCourierModalOptions = { required: true };
    this.modalService
      .open(this.updateCourierModal)
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'courierName',
            value
          })
        );
        this.updatedMessage$.next('Courier was updated');
      })
      .catch(() => undefined);
  }

  updateTrackingNumber() {
    this.updateTrackingNumberModalOptions = { required: true };
    this.modalService
      .open(this.updateTrackingNumberModal)
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'trackingNumber',
            value
          })
        );
        this.updatedMessage$.next('Tracking Number was updated');
      })
      .catch(() => undefined);
  }

  updateFromLocation() {
    this.updateFromLocationInfoModalOptions = { required: true };
    this.modalService
      .open(this.updateFromLocationModal)
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'fromLocation',
            value
          })
        );
        this.updatedMessage$.next('From Location was updated');
      })
      .catch(() => undefined);
  }

  updateToLocation() {
    this.updateToLocationInfoModalOptions = { required: true };
    this.modalService
      .open(this.updateToLocationModal)
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'toLocation',
            value
          })
        );
        this.updatedMessage$.next('To Location was updated');
      })
      .catch(() => undefined);
  }

  removeShipment() {
    this.onRemove.emit(this.shipment);
  }
}
