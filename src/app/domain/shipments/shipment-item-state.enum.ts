/**
 * The states that a {@link app.domain.shipments.ShipmentSpecimen ShipmentSpecimen} can be in.
 */
export enum ShipmentItemState {

  /** The item in the shipment is present in the physical package. */
  PRESENT = 'present',

  /** The item in the shipment is was present in the physical package and removed. */
  RECEIVED = 'received',

  /** The item in the shipment is was missing from the physical package. */
  MISSING = 'missing',

  /** The physical package contained an item that was not in the manifest. */
EXTRA = 'extra'

}
