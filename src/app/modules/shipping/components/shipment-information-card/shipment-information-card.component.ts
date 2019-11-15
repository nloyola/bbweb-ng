import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NotificationService } from '@app/core/services';
import { Shipment } from '@app/domain/shipments';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-information-card',
  templateUrl: './shipment-information-card.component.html',
  styleUrls: ['./shipment-information-card.component.scss']
})
export class ShipmentInformationCardComponent implements OnInit, OnDestroy {
  @ViewChild('updateCourierModal', { static: false }) updateCourierModal: TemplateRef<any>;
  @ViewChild('updateTrackingNumberModal', { static: false }) updateTrackingNumberModal: TemplateRef<any>;
  @ViewChild('updateOriginModal', { static: false }) updateOriginModal: TemplateRef<any>;
  @ViewChild('updateDestinationModal', { static: false }) updateDestinationModal: TemplateRef<any>;

  @Input() shipment: Shipment;
  @Input() displayState: boolean;
  @Input() showMenu = false;
  @Input() collapsible = false;

  @Output() onShipmentUpdate = new EventEmitter<boolean>();
  @Output() onRemove = new EventEmitter<Shipment>();

  faBoxOpen = faBoxOpen;
  isLoading$: Observable<boolean>;
  shipment$: Observable<Shipment>;
  isCardCollapsed: boolean;
  updateCourierModalOptions: ModalInputTextOptions;
  updateTrackingNumberModalOptions: ModalInputTextOptions;
  updateOriginModalOptions: ModalInputTextOptions;
  updateDestinationModalOptions: ModalInputTextOptions;
  menuItems: DropdownMenuItem[];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.menuItems = this.createMenuItems();
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
        filter(() => this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.notificationService.show();
        this.onShipmentUpdate.emit(false);
      });

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(error => !!error && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (
          errMessage &&
          errMessage.match(/EntityCriteriaError: shipment with tracking number already exists/)
        ) {
          errMessage = `That Tracking Number is already in use by another shipment.`;
        }
        this.notificationService.showError(errMessage, 'Update Error');
        this.onShipmentUpdate.emit(false);
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateCourier() {
    this.updateCourierModalOptions = { required: true };
    this.modalService
      .open(this.updateCourierModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'courierName',
            value
          })
        );
        this.onShipmentUpdate.emit(true);
        this.notificationService.add('Courier was updated', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  updateTrackingNumber() {
    this.updateTrackingNumberModalOptions = { required: true };
    this.modalService
      .open(this.updateTrackingNumberModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'trackingNumber',
            value
          })
        );
        this.onShipmentUpdate.emit(true);
        this.notificationService.add('Tracking Number was updated', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  updateOrigin() {
    this.updateOriginModalOptions = { required: true };
    this.modalService
      .open(this.updateOriginModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'origin',
            value
          })
        );
        this.onShipmentUpdate.emit(true);
        this.notificationService.add('From Location was updated', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  updateDestination() {
    this.updateDestinationModalOptions = { required: true };
    this.modalService
      .open(this.updateDestinationModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'destination',
            value
          })
        );
        this.onShipmentUpdate.emit(true);
        this.notificationService.add('To Location was updated', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  private createMenuItems(): DropdownMenuItem[] {
    return [
      {
        kind: 'selectable',
        label: 'Update Courier',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateCourier();
        }
      },
      {
        kind: 'selectable',
        label: 'Update Tracking Number',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateTrackingNumber();
        }
      },
      {
        kind: 'selectable',
        label: 'Update Origin',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateOrigin();
        }
      },
      {
        kind: 'selectable',
        label: 'Update Destination',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateDestination();
        }
      },
      {
        kind: 'selectable',
        label: 'Remove Shipment',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.onRemove.emit(this.shipment);
        }
      }
    ];
  }
}
