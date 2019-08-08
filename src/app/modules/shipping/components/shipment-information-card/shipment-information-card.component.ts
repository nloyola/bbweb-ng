import { Component, OnInit, Input, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { Shipment } from '@app/domain/shipments';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { Store, select } from '@ngrx/store';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { Subject, Observable } from 'rxjs';
import { map, shareReplay, tap, withLatestFrom, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shipment-information-card',
  templateUrl: './shipment-information-card.component.html',
  styleUrls: ['./shipment-information-card.component.scss']
})
export class ShipmentInformationCardComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;

  @ViewChild('updateCourierModal', { static: false }) updateCourierModal: TemplateRef<any>;

  shipment$: Observable<Shipment>;
  isCardCollapsed: boolean;
  updateCourierModalOptions: ModalInputTextOptions;

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
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipment$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, msg]) => {
        if (msg !== null && shipment !== undefined) {
          this.shipment = shipment;
          this.toastr.success(msg, 'Update Successfull');
          this.updatedMessage$.next(null);
        }
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
    console.log('updateTrackingNumber');
  }

  updateFromLocation() {
    console.log('updateFromLocation');
  }

  updateToLocation() {
    console.log('updateToLocation');
  }

  removeShipment() {
    console.log('removeShipment');
  }
}
