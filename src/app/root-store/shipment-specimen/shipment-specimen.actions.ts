import { PagedReply, SearchParams } from '@app/domain';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { createAction, props, union } from '@ngrx/store';

export const searchShipmentSpecimensRequest = createAction(
  '[ShipmentSpecimen] Search Shipment Specimens Request',
  props<{
    shipment: Shipment;
    searchParams: SearchParams;
  }>()
);

export const searchShipmentSpecimensSuccess = createAction(
  '[ShipmentSpecimen] Search Shipment Specimens Success',
  props<{ pagedReply: PagedReply<ShipmentSpecimen> }>()
);

export const searchShipmentSpecimensFailure = createAction(
  '[ShipmentSpecimen] Search Shipments Specimens Failure',
  props<{ error: any }>()
);

export const getShipmentSpecimenRequest = createAction(
  '[ShipmentSpecimen] Get Shipment Specimen Request',
  props<{ id: string }>()
);

export const getShipmentSpecimenSuccess = createAction(
  '[ShipmentSpecimen] Get Shipment Specimen Success',
  props<{ shipmentSpecimen: ShipmentSpecimen }>()
);

export const getShipmentSpecimenFailure = createAction(
  '[ShipmentSpecimen] Get Shipment Specimen Failure',
  props<{ error: any }>()
);

export const removeShipmentSpecimenRequest = createAction(
  '[ShipmentSpecimen] Remove Shipment Specimen Request',
  props<{ shipmentSpecimen: ShipmentSpecimen }>()
);

export const removeShipmentSpecimenSuccess = createAction(
  '[ShipmentSpecimen] Remove Shipment Specimen Success',
  props<{ shipmentSpecimenId: string }>()
);

export const removeShipmentSpecimenFailure = createAction(
  '[ShipmentSpecimen] Remove Shipment Specimen Failure',
  props<{ error: any }>()
);

const all = union({
  searchShipmentSpecimensRequest,
  searchShipmentSpecimensSuccess,
  searchShipmentSpecimensFailure,
  getShipmentSpecimenRequest,
  getShipmentSpecimenSuccess,
  getShipmentSpecimenFailure,
  removeShipmentSpecimenRequest,
  removeShipmentSpecimenSuccess,
  removeShipmentSpecimenFailure
});
export type ShipmentSpecimenActionsUnion = typeof all;
