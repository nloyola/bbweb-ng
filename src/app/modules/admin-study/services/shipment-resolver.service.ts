import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, race, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShipmentResolver implements Resolve<Shipment> {
  constructor(private store$: Store<RootStoreState.State>, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<Shipment> {
    const id = route.paramMap.get('id');
    this.store$.dispatch(ShipmentStoreActions.getShipmentRequest({ id }));

    return race<any>(
      this.store$.pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(s => !!s),
        tap(() => this.router.navigateByUrl('/404'))
      ),
      this.store$.pipe(
        select(ShipmentStoreSelectors.selectAllShipments),
        filter(s => s.length > 0),
        map((shipments: Shipment[]) => {
          const shipment = shipments.find(s => s.id === id);
          if (shipment) {
            return shipment instanceof Shipment ? shipment : new Shipment().deserialize(shipment);
          }
          return throwError('shipment not found');
        })
      )
    ).pipe(take(1));
  }
}
