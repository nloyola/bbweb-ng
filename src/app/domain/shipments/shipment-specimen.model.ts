import { ShipmentItemState } from './shipment-item-state.enum';
import { ConcurrencySafeEntity, IConcurrencySafeEntity, JSONObject } from '@app/domain';

/**
 * Marks a specific {@link app.domain.participants.Specimen Specimen} as having been in a specific {@link
 * app.domain.shipment.Shipment Shipment}.
 */
export interface IShipmentSpecimen extends IConcurrencySafeEntity {

  /** The state this shipment specimen is in. */
  state: ShipmentItemState;

  /** The shipment this shipment specimen is in. */
  shipmentId: string;

  /** The specimen this shipment specimen is linked to. */
  specimenId: string;

  /** The shipment container this shipment specimen can be found in. */
  shipmentContainerId: string;

}

export class ShipmentSpecimen extends ConcurrencySafeEntity {

  state: ShipmentItemState;
  shipmentId: string;
  specimenId: string;
  shipmentContainerId: string;

  deserialize(input: JSONObject) {
    super.deserialize(input);
    return this;
  }

}
