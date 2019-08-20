import { ShipmentItemState } from './shipment-item-state.enum';
import { ConcurrencySafeEntity, IConcurrencySafeEntity, JSONObject } from '@app/domain';
import { Specimen, ISpecimen } from '../participants';

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

  specimen: ISpecimen;
}

export class ShipmentSpecimen extends ConcurrencySafeEntity implements IShipmentSpecimen {
  state: ShipmentItemState;
  shipmentId: string;
  specimenId: string;
  shipmentContainerId: string;
  specimen: Specimen;

  deserialize(input: IShipmentSpecimen): this {
    const { state, shipmentId, specimenId, shipmentContainerId } = input;
    Object.assign(this, { state, shipmentId, specimenId, shipmentContainerId });
    super.deserialize(input);
    if (input.specimen) {
      this.specimen = new Specimen().deserialize(input.specimen);
      this.specimenId = this.specimen.id;
    }
    return this;
  }
}
