export enum ShipmentState {
  /** A shipment that is being created. Items are still being added to it.*/
  CREATED = 'created',

  /** A shipment that has been packed. All items have been added to it. */
  PACKED = 'packed',

  /** A shipment that has been sent to it's destination. */
  SENT = 'sent',

  /** A shipment that has been received at it's destination. */
  RECEIVED = 'received',

  /** A shipment that is being unpacked. Items are being unpacked. */
  UNPACKED = 'unpacked',

  /** A shipment that who's items were unpacked and stored. */
  COMPLETED = 'completed',

  /** A shipment that was lost during transit. */
  LOST = 'lost'
}
