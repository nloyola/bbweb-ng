export enum ShipmentState {
  /** A shipment that is being created. Items are still being added to it.*/
  Created = 'created',

  /** A shipment that has been packed. All items have been added to it. */
  Packed = 'packed',

  /** A shipment that has been sent to it's destination. */
  Sent = 'sent',

  /** A shipment that has been received at it's destination. */
  Received = 'received',

  /** A shipment that is being unpacked. Items are being unpacked. */
  Unpacked = 'unpacked',

  /** A shipment that who's items were unpacked and stored. */
  Completed = 'completed',

  /** A shipment that was lost during transit. */
  Lost = 'lost'
}
