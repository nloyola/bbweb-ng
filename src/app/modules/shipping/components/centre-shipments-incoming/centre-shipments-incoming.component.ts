import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchParams } from '@app/domain';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { Store } from '@ngrx/store';
import { CentreShipmentsBaseComponent } from '../centre-shipments-base/centre-shipments-base.component';

@Component({
  selector: 'app-centre-shipments-incoming',
  templateUrl: './centre-shipments-incoming.component.html',
  styleUrls: ['./centre-shipments-incoming.component.scss']
})
export class CentreShipmentsIncomingComponent extends CentreShipmentsBaseComponent {
  constructor(store$: Store<RootStoreState.State>, route: ActivatedRoute) {
    super(store$, route);
    this.stateFilterInit();
  }

  sortBy(sortField: string) {
    if (sortField.includes('location')) {
      this.sortField = (sortField.charAt(0) === '-' ? '-' : '') + 'fromLocationName';
      this.updateShipments();
    } else {
      super.sortBy(sortField);
    }
  }

  protected updateFilters(): string {
    let filters = `toCentre::${this.centre.name}`;
    const filterValues = [this.courierNameFilter, this.trackingNumberFilter, this.stateFilter]
      .map(f => f.getValue())
      .filter(v => v !== '')
      .join(';');
    if (filterValues !== '') {
      filters += ';' + filterValues;
    }
    return filters;
  }
}
