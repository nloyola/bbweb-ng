import { Injectable } from '@angular/core';
import { ShipmentSpecimenService } from '@app/core/services';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ShipmentSpecimenActions from './shipment-specimen.actions';

@Injectable()
export class ShipmentSpecimenStoreEffects {
  constructor(
    private actions$: Actions<ShipmentSpecimenActions.ShipmentSpecimenActionsUnion>,
    private shipmentSpecimenService: ShipmentSpecimenService
  ) {}

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(ShipmentSpecimenActions.getShipmentSpecimenRequest.type),
    map(action => action.id),
    switchMap(id =>
      this.shipmentSpecimenService.get(id).pipe(
        map(shipmentSpecimen => ShipmentSpecimenActions.getShipmentSpecimenSuccess({ shipmentSpecimen })),
        catchError(error => observableOf(ShipmentSpecimenActions.getShipmentSpecimenFailure({ error })))
      )
    )
  );

  @Effect()
  searchRequest$ = this.actions$.pipe(
    ofType(ShipmentSpecimenActions.searchShipmentSpecimensRequest.type),
    switchMap(action =>
      this.shipmentSpecimenService.search(action.shipment, action.searchParams).pipe(
        /* tslint:disable-next-line:max-line-length */
        map(pagedReply => ShipmentSpecimenActions.searchShipmentSpecimensSuccess({ pagedReply })),
        /* tslint:disable-next-line:max-line-length */
        catchError(error => observableOf(ShipmentSpecimenActions.searchShipmentSpecimensFailure({ error })))
      )
    )
  );
}
