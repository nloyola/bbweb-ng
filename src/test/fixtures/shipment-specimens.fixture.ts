export namespace ShipmentSpecimensFixture {
  export const errors = [
    'invalid inventory Ids',
    'specimens not in this shipment',
    'shipment specimens not present',
    'specimen inventory IDs already in this shipment',
    'specimens are already in an active shipment',
    'simulated error'
  ].map(errMessage => [errMessage, { error: { message: `:${errMessage}:` } }]);
}
