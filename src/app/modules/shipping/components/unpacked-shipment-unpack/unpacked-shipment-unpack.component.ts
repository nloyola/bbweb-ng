import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateFilter } from '@app/domain/search-filters';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { tap, filter } from 'rxjs/operators';
import { UnpackedShipmentSpeciemensComponent } from '../unpacked-shipment-specimens/unpacked-shipment-specimens.component';
import { ShipmentSpecimenAction } from '../shipment-specimens-table/shipment-specimens-table.container';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '@app/core/services';

@Component({
  selector: 'app-unpacked-shipment-unpack',
  templateUrl: './unpacked-shipment-unpack.component.html',
  styleUrls: ['./unpacked-shipment-unpack.component.scss']
})
export class UnpackedShipmentUnpackComponent extends UnpackedShipmentSpeciemensComponent {
  @ViewChild('receiveSpecimenError', { static: false }) receiveSpecimenError: TemplateRef<any>;

  faVial = faVial;
  shipment: Shipment;
  form: FormGroup;
  specimenFilter = new StateFilter(Object.values(ShipmentItemState), ShipmentItemState.Present, false);
  receiveErrorMessage: string;
  actions: ShipmentSpecimenAction[] = [
    {
      id: 'tagAsMissing',
      label: 'Tag Specimen as Missing',
      icon: 'check_circle',
      iconClass: 'danger-icon'
    }
  ];

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    private modalService: NgbModal,
    private notificationService: NotificationService
  ) {
    super(store$, route);
  }

  ngOnInit() {
    super.ngOnInit();

    this.shipment$
      .pipe(filter(shipment => shipment !== undefined && this.notificationService.notificationPending()))
      .subscribe(() => {
        this.notificationService.show();
      });

    this.error$.subscribe(errorMessage => {
      this.receiveErrorMessage = errorMessage;
      this.modalService.open(this.receiveSpecimenError, { size: 'lg' });
    });
  }

  receiveShipmentSpecimens(specimenInventoryIds: string[]): void {
    this.store$.dispatch(
      ShipmentStoreActions.tagSpecimensRequest({
        shipment: this.shipment,
        specimenInventoryIds,
        specimenTag: ShipmentItemState.Received
      })
    );
    this.shipmentLoading$.next(true);
    this.markTagPending();
    this.notificationService.add('Specimen(s) received');
  }

  shipmentSpecimenAction([shipmentSpecimen, actionId]) {
    switch (actionId) {
      case 'tagAsMissing':
        this.tagSpecimen(shipmentSpecimen, ShipmentItemState.Missing);
        this.notificationService.add('Specimen tagged as Missing');
        this.markTagPending();
        break;

      default:
        throw new Error(`action ${actionId} is not handled`);
    }
  }
}
