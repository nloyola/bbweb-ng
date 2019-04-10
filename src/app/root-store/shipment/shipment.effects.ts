import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ShipmentActions from './shipment.actions';
import { ShipmentService, ShipmentUpdateAttribute } from '@app/core/services';

@Injectable()
export class ShipmentStoreEffects {

  constructor(private actions$: Actions<ShipmentActions.ShipmentActionsUnion>,
              private shipmentService: ShipmentService) { }

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.getShipmentRequest.type),
    map(action => action.slug),
    switchMap(
      slug => this.shipmentService.get(slug).pipe(
        map(shipment => ShipmentActions.getShipmentSuccess({ shipment })),
        catchError(error => observableOf(ShipmentActions.getShipmentFailure({ error }))))
    )
  );

  @Effect()
  searchRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.searchShipmentsRequest.type),
    map(action => action.searchParams),
    switchMap(
      searchParams =>
        this.shipmentService.search(searchParams).pipe(
          map(pagedReply => ShipmentActions.searchShipmentsSuccess({ pagedReply })),
          catchError(error => observableOf(ShipmentActions.searchShipmentsFailure({ error }))))
    )
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.addShipmentRequest.type),
    map(action => action.shipment),
    switchMap(
      shipment =>
        this.shipmentService.add(shipment).pipe(
          map(shipment => ShipmentActions.addShipmentSuccess({ shipment })),
          catchError(error => observableOf(ShipmentActions.addShipmentFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.updateShipmentRequest.type),
    map(action => action.request),
    switchMap(
      request =>
        this.shipmentService.update(request.shipment, request.attributeName, request.value).pipe(
          map(shipment => ShipmentActions.updateShipmentSuccess({ shipment })),
          catchError(error => observableOf(ShipmentActions.updateShipmentFailure({ error }))))
    )
  );

}
