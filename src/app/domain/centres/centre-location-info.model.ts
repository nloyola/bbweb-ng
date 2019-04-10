import { IDomainEntity, DomainEntity, JSONObject } from '@app/domain';

export interface ICentreLocationInfo extends IDomainEntity {

  /** the ID that identifies the centre. */
  centreId: string;

  /** the ID that identifies the location. */
  locationId: string;

  /** the centre's name concatenated with the location name. */
  name: string;

}

export class CentreLocationInfo extends DomainEntity {

  centreId: string;
  locationId: string;
  name: string;

  deserialize(input: JSONObject) {
    super.deserialize(input);
    return this;
  }

 }
