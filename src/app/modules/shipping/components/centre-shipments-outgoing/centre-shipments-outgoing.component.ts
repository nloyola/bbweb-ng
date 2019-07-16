import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchParams } from '@app/domain';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { Store } from '@ngrx/store';
import { CentreShipmentsBaseComponent } from '../centre-shipments-base/centre-shipments-base.component';

@Component({
  selector: 'app-centre-shipments-outgoing',
  templateUrl: './centre-shipments-outgoing.component.html',
  styleUrls: ['./centre-shipments-outgoing.component.scss']
})
export class CentreShipmentsOutgoingComponent extends CentreShipmentsBaseComponent {
  constructor(store$: Store<RootStoreState.State>, route: ActivatedRoute) {
    super(store$, route);
    this.stateFilterInit();
  }

  sortBy(sortField: string) {
    if (sortField.includes('location')) {
      this.sortField = (sortField.charAt(0) === '-' ? '-' : '') + 'toLocationName';
      this.updateShipments();
    } else {
      super.sortBy(sortField);
    }
  }

  protected updateFilters(): string {
    let filters = `fromCentre::${this.centre.name}`;
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
