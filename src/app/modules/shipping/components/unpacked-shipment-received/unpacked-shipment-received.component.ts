import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateFilter } from '@app/domain/search-filters';
import { ShipmentItemState } from '@app/domain/shipments';
import { RootStoreState } from '@app/root-store';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { ShipmentSpecimenAction } from '../shipment-specimens-table/shipment-specimens-table.container';
import { UnpackedShipmentSpeciemensComponent } from '../unpacked-shipment-specimens/unpacked-shipment-specimens.component';
import { NotificationService } from '@app/core/services';

@Component({
  selector: 'app-unpacked-shipment-received',
  templateUrl: './unpacked-shipment-received.component.html',
  styleUrls: ['./unpacked-shipment-received.component.scss']
})
export class UnpackedShipmentReceivedComponent extends UnpackedShipmentSpeciemensComponent {
  specimenFilter = new StateFilter(Object.values(ShipmentItemState), ShipmentItemState.Received, false);
  actions: ShipmentSpecimenAction[] = [
    {
      id: 'tagAsPresent',
      label: 'Tag Specimen as Unpacked',
      icon: 'check_circle',
      iconClass: 'success-icon'
    }
  ];

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
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

    this.error$.pipe(filter(() => this.notificationService.notificationPending())).subscribe(errorMessage => {
      this.notificationService.showError(errorMessage);
    });
  }

  shipmentSpecimenAction([shipmentSpecimen, actionId]) {
    switch (actionId) {
      case 'tagAsPresent':
        this.tagSpecimen(shipmentSpecimen, ShipmentItemState.Present);
        this.notificationService.add('Specimen tagged as Unpacked');
        this.markTagPending();
        break;

      default:
        throw new Error(`action ${actionId} is not handled`);
    }
  }
}
