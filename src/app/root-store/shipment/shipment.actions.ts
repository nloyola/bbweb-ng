import { props, createAction, union } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Shipment, ShipmentItemState } from '@app/domain/shipments';
import { ShipmentUpdateAttribute } from '@app/core/services';
import { Specimen } from '@app/domain/participants';

export const searchShipmentsRequest = createAction(
  '[Shipment] Search Shipments Request',
  props<{ searchParams: SearchParams }>()
);

export const searchShipmentsSuccess = createAction(
  '[Shipment] Search Shipments Success',
  props<{ pagedReply: PagedReply<Shipment> }>()
);

export const searchShipmentsFailure = createAction(
  '[Shipment] Search Shipments Failure',
  props<{ error: any }>()
);

export const addShipmentRequest = createAction(
  '[Shipment] Add Shipment Request',
  props<{ shipment: Shipment }>()
);

export const addShipmentSuccess = createAction(
  '[Shipment] Add Shipment Success',
  props<{ shipment: Shipment }>()
);

export const addShipmentFailure = createAction(
  '[Shipment] Add Shipment Failure',
  props<{ error: any }>()
);

export const getShipmentRequest = createAction(
  '[Shipment] Get Shipment Request',
  props<{ id: string }>()
);

export const getShipmentSuccess = createAction(
  '[Shipment] Get Shipment Success',
  props<{ shipment: Shipment }>()
);

export const getShipmentFailure = createAction(
  '[Shipment] Get Shipment Failure',
  props<{ error: any }>()
);

export const updateShipmentRequest = createAction(
  '[Shipment] Update Shipment Request',
  props<{
    shipment: Shipment,
    attributeName: ShipmentUpdateAttribute,
    value: string | Date
  }>()
);

export const updateShipmentSuccess = createAction(
  '[Shipment] Update Shipment Success',
  props<{ shipment: Shipment }>()
);

export const updateShipmentFailure = createAction(
  '[Shipment] Update Shipment Failure',
  props<{ error: any }>()
);

export const addSpecimensRequest = createAction(
  '[Shipment] Add Specimens Request',
  props<{
    shipment:             Shipment,
    specimenInventoryIds: string[],
    shipmentContainerId?: string
  }>()
);

export const addSpecimensSuccess = createAction(
  '[Shipment] Add Specimens Success',
  props<{ shipment: Shipment }>()
);

export const addSpecimensFailure = createAction(
  '[Shipment] Add Specimens Failure',
  props<{ error: any }>()
);

export const canAddSpecimenRequest = createAction(
  '[Shipment] Can Add Specimen Request',
  props<{ inventoryId: string }>()
);

export const canAddSpecimenSuccess = createAction(
  '[Shipment] Can Add Specimen Success',
  props<{ specimen: Specimen }>()
);

export const canAddSpecimenFailure = createAction(
  '[Shipment] Can Add Specimen Failure',
  props<{ error: any }>()
);

export const tagSpecimensRequest = createAction(
  '[Shipment] Tag Sepcimens Request',
  props<{
    shipment:             Shipment,
    specimenInventoryIds: string[],
    specimenTag:          ShipmentItemState
  }>()
);

export const tagSpecimensSuccess = createAction(
  '[Shipment] Tag Sepcimens Success',
  props<{ shipment: Shipment }>()
);

export const tagSpecimensFailure = createAction(
  '[Shipment] Tag Sepcimens Failure',
  props<{ error: any }>()
);

export const removeShipmentRequest = createAction(
  '[Shipment] Remove Shipment Request',
  props<{ shipment: Shipment }>()
);

export const removeShipmentSuccess = createAction(
  '[Shipment] Remove Shipment Success',
  props<{ shipmentId: string }>()
);

export const removeShipmentFailure = createAction(
  '[Shipment] Remove Shipment Failure',
  props<{ error: any }>()
);

const all = union({
  searchShipmentsRequest,
  searchShipmentsSuccess,
  searchShipmentsFailure,
  addShipmentRequest,
  addShipmentSuccess,
  addShipmentFailure,
  getShipmentRequest,
  getShipmentSuccess,
  getShipmentFailure,
  updateShipmentRequest,
  updateShipmentSuccess,
  updateShipmentFailure,
  addSpecimensRequest,
  addSpecimensSuccess,
  addSpecimensFailure,
  canAddSpecimenRequest,
  canAddSpecimenSuccess,
  canAddSpecimenFailure,
  tagSpecimensRequest,
  tagSpecimensSuccess,
  tagSpecimensFailure,
  removeShipmentRequest,
  removeShipmentSuccess,
  removeShipmentFailure
});
export type ShipmentActionsUnion = typeof all;
