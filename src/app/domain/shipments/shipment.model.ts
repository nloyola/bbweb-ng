import { ConcurrencySafeEntity, IConcurrencySafeEntity, JSONObject } from '@app/domain';
import { CentreLocationInfo } from '@app/domain/centres';
import { ShipmentState } from './shipment-state.enum';

export interface IShipment extends IConcurrencySafeEntity {

  /** The state this shipment is in. */
  state: ShipmentState;

  /** The name of the courier company used to ship this package. */
  courierName: string;

  /** The tracking number used by the courier company used to track the package. */
  trackingNumber: string;

  /** The information for the centre location which is sending the specimens. */
  fromLocationInfo: CentreLocationInfo;

  /** The information for the centre location which is receiving the specimens. */
  toLocationInfo: CentreLocationInfo;

  /** The date and time when the shipment was packed. */
  timePacked?: Date;

  /** The date and time when the shipment was sent. */
  timeSent?: Date;

  /** The date and time when the shipment was received. */
  timeReceived?: Date;

  /** The date and time when the shipment was unpacked. */
  timeUpacked?: Date;

  /** The date and time when all the specimens and containers were unpacked from the shipment. */
  timeCompleted?: Date;

}

export class Shipment extends ConcurrencySafeEntity {

  state: ShipmentState;
  courierName: string;
  trackingNumber: string;
  fromLocationInfo: CentreLocationInfo;
  toLocationInfo: CentreLocationInfo;
  timePacked?: Date;
  timeSent?: Date;
  timeReceived?: Date;
  timeUpacked?: Date;
  timeCompleted?: Date;

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.fromLocationInfo) {
      this.fromLocationInfo =
        new CentreLocationInfo().deserialize(input.fromLocationInfo as JSONObject);
    }
    if (input.toLocationInfo) {
      this.toLocationInfo =
        new CentreLocationInfo().deserialize(input.toLocationInfo as JSONObject);
    }
    return this;
  }
}
