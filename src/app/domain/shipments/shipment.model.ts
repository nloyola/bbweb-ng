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
  timeUnpacked?: Date;

  /** The date and time when all the specimens and containers were unpacked from the shipment. */
  timeCompleted?: Date;

  /** the number of specimens in the shipment. */
  specimenCount: number;
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
  specimenCount: number;

  /**
   * A predicate to test if the shipment's state is CREATED.
   */
  isCreated() {
    return this.state === ShipmentState.Created;
  }

  /**
   * A predicate to test if the shipment's state is PACKED.
   */
  isPacked() {
    return this.state === ShipmentState.Packed;
  }

  /**
   * A predicate to test if the shipment's state is SENT.
   */
  isSent() {
    return this.state === ShipmentState.Sent;
  }

  /**
   * A predicate to test if the shipment's state is RECEIVED.
   */
  isReceived() {
    return this.state === ShipmentState.Received;
  }

  /**
   * A predicate to test if the shipment's state is UNPACKED.
   */
  isUnpacked() {
    return this.state === ShipmentState.Unpacked;
  }

  /**
   * A predicate to test if the shipment's state is COMPLETED.
   */
  isCompleted() {
    return this.state === ShipmentState.Completed;
  }

  /**
   * A predicate to test if the shipment's state is LOST.
   */
  isLost() {
    return this.state === ShipmentState.Lost;
  }

  /**
   * A predicate to test if the shipment's state is NOT CREATED or UNPACKED.
   */
  isNotCreatedNorUnpacked() {
    return this.state !== ShipmentState.Created && this.state !== ShipmentState.Unpacked;
  }

  deserialize(input: IShipment): this {
    const { state, courierName, trackingNumber, specimenCount } = input;
    Object.assign(this, { state, courierName, trackingNumber, specimenCount });
    super.deserialize(input);

    if (input.timePacked) {
      this.timePacked = new Date(input.timePacked);
    }
    if (input.timeSent) {
      this.timeSent = new Date(input.timeSent);
    }
    if (input.timeReceived) {
      this.timeReceived = new Date(input.timeReceived);
    }
    if (input.timeUnpacked) {
      this.timeUpacked = new Date(input.timeUnpacked);
    }
    if (input.timeCompleted) {
      this.timeCompleted = new Date(input.timeCompleted);
    }

    if (input.fromLocationInfo) {
      this.fromLocationInfo = new CentreLocationInfo().deserialize(input.fromLocationInfo);
    }
    if (input.toLocationInfo) {
      this.toLocationInfo = new CentreLocationInfo().deserialize(input.toLocationInfo);
    }

    ['timePacked', 'timeSent', 'timeReceived', 'timeUpacked', 'timeCompleted'].forEach(time => {
      if (input[time]) {
        this[time] = new Date(input[time] as string);
      }
    });

    return this;
  }

  getTime(): Date {
    switch (this.state) {
      case ShipmentState.Created:
        return this.timeAdded;
      case ShipmentState.Packed:
        return this.timePacked;
      case ShipmentState.Sent:
        return this.timeSent;
      case ShipmentState.Received:
        return this.timeReceived;
      case ShipmentState.Unpacked:
        return this.timeUpacked;
      case ShipmentState.Completed:
        return this.timeCompleted;

      default:
        throw new Error(`shipment does not have a time for current state: ${this.state}`);
    }
  }
}
