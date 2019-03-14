import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { HasName } from './has-name.model';
import { JSONObject } from './json-object.model';

export interface ILocation extends IDomainEntity, HasName {

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

}

export class Location extends DomainEntity implements ILocation {

  name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  poBoxNumber: string;
  countryIsoCode: string;

  deserialize(input: JSONObject) {
    Object.assign(this, input);
    return this;
  }
}
