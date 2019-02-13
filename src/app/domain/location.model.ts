import { DomainEntity } from './domain-entity.model';

export class Location extends DomainEntity {

  /** A short identifying name that is unique. */
  name: string;

  /** The street address for this location. */
  street: string;

  /** The city the location is in. */
  city: string;

  /** The province or territory the location is in. */
  province: string;

  /** The postal code for the location. */
  postalCode: string;

  /** The postal office box number this location receives mail at. */
  poBoxNumber: string;

  /** The ISO country code for the country the location is in. */
  countryIsoCode: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
