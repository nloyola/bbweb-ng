/**
 * Describes how a {@link Specimen} should be preserved/stored by describing
 * temperature requirements (degrees Celsius).
 */
export enum PreservationTemperature {
  PLUS_4_CELCIUS = '4 C',
  MINUS_20_CELCIUS = '-20 C',
  MINUS_80_CELCIUS = '-80 C',
  MINUS_180_CELCIUS = '-180 C',
  ROOM_TEMPERATURE = 'Room Temperature'
}
