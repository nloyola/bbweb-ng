import { Injectable } from '@angular/core';
import { ShipmentService } from '@app/core/services';
import { Specimen } from '@app/domain/participants';
import { Shipment, ShipmentItemState } from '@app/domain/shipments';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ShipmentActions from './shipment.actions';

@Injectable()
export class ShipmentStoreEffects {
  constructor(
    private actions$: Actions<ShipmentActions.ShipmentActionsUnion>,
    private shipmentService: ShipmentService
  ) {}

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.getShipmentRequest.type),
    map(action => action.id),
    switchMap(id =>
      this.shipmentService.get(id).pipe(
        map(shipment => ShipmentActions.getShipmentSuccess({ shipment })),
        catchError(error => observableOf(ShipmentActions.getShipmentFailure({ error })))
      )
    )
  );

  @Effect()
  searchRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.searchShipmentsRequest.type),
    map(action => action.searchParams),
    switchMap(searchParams =>
      this.shipmentService.search(searchParams).pipe(
        map(pagedReply => ShipmentActions.searchShipmentsSuccess({ pagedReply })),
        catchError(error => observableOf(ShipmentActions.searchShipmentsFailure({ error })))
      )
    )
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.addShipmentRequest.type),
    map(action => action.shipment),
    switchMap(sh =>
      this.shipmentService.add(sh).pipe(
        map(shipment => ShipmentActions.addShipmentSuccess({ shipment })),
        catchError(error => observableOf(ShipmentActions.addShipmentFailure({ error })))
      )
    )
  );

  @Effect()
  updateRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.updateShipmentRequest.type),
    switchMap(action =>
      this.shipmentService.update(action.shipment, action.attributeName, action.value).pipe(
        map(shipment => ShipmentActions.updateShipmentSuccess({ shipment })),
        catchError(error => observableOf(ShipmentActions.updateShipmentFailure({ error })))
      )
    )
  );

  @Effect()
  addSpecimensRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.addSpecimensRequest.type),
    switchMap(action =>
      this.shipmentService
        .addSpecimens(action.shipment, action.specimenInventoryIds, action.shipmentContainerId)
        .pipe(
          map(shipment => ShipmentActions.addSpecimensSuccess({ shipment })),
          catchError(error => observableOf(ShipmentActions.addSpecimensFailure({ error })))
        )
    )
  );

  @Effect()
  canAddSpecimenRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.canAddSpecimenRequest.type),
    switchMap(action =>
      this.shipmentService.canAddSpecimen(action.inventoryId).pipe(
        map((specimen: Specimen) => ShipmentActions.canAddSpecimenSuccess({ specimen })),
        catchError(error => observableOf(ShipmentActions.canAddSpecimenFailure({ error })))
      )
    )
  );

  @Effect()
  tagSpecimensRequest$ = this.actions$.pipe(
    ofType(ShipmentActions.tagSpecimensRequest.type),
    switchMap(action => {
      let methodName: string;
      switch (action.specimenTag) {
        case ShipmentItemState.Present:
          methodName = 'tagSpecimensAsPresent';
          break;
        case ShipmentItemState.Received:
          methodName = 'tagSpecimensAsReceived';
          break;
        case ShipmentItemState.Missing:
          methodName = 'tagSpecimensAsMissing';
          break;
        case ShipmentItemState.Extra:
          methodName = 'tagSpecimensAsExtra';
          break;
        default:
          return observableOf(
            ShipmentActions.tagSpecimensFailure({
              error: {
                message: `specimen tag ${action.specimenTag} is invalid`
              }
            })
          );
      }

      return this.shipmentService[methodName](action.shipment, action.specimenInventoryIds).pipe(
        map((shipment: Shipment) => ShipmentActions.tagSpecimensSuccess({ shipment })),
        catchError(error => observableOf(ShipmentActions.tagSpecimensFailure({ error })))
      );
    })
  );

  @Effect()
  removeShipmentRequest$: Observable<Action> = this.actions$.pipe(
    ofType(ShipmentActions.removeShipmentRequest.type),
    switchMap(action =>
      this.shipmentService.remove(action.shipment).pipe(
        // delay(2000),
        map(shipmentId => ShipmentActions.removeShipmentSuccess({ shipmentId })),
        catchError(error => observableOf(ShipmentActions.removeShipmentFailure({ error })))
      )
    )
  );
}
