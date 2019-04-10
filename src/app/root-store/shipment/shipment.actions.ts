import { props, createAction, union } from '@ngrx/store';
import { SearchParams, PagedReply } from '@app/domain';
import { Shipment } from '@app/domain/shipments';
import { ShipmentUpdateAttribute } from '@app/core/services';

export interface ShipmentUpdateRequestProp {
  shipment: Shipment;
  attributeName: ShipmentUpdateAttribute;
  value: string | Date;
}

export const searchShipmentsRequest = createAction(
  '[Shipment] Search Shipment Request',
  props<{ searchParams: SearchParams }>()
);

export const searchShipmentsSuccess = createAction(
  '[Shipment] Search Shipment Success',
  props<{ pagedReply: PagedReply<Shipment> }>()
);

export const searchShipmentsFailure = createAction(
  '[Shipment] Search Shipment Failure',
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
  props<{ request: ShipmentUpdateRequestProp }>()
);

export const updateShipmentSuccess = createAction(
  '[Shipment] Update Shipment Success',
  props<{ shipment: Shipment }>()
);

export const updateShipmentFailure = createAction(
  '[Shipment] Update Shipment Failure',
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
  updateShipmentFailure
});
export type ShipmentActionsUnion = typeof all;
