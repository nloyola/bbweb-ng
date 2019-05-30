import { IDomainEntity, DomainEntity, JSONObject } from '@app/domain';

export interface ICentreLocationInfo {

  /** the ID that identifies the centre. */
  centreId: string;

  /** the ID that identifies the location. */
  locationId: string;

  /** the centre's name concatenated with the location name. */
  name: string;

}

export class CentreLocationInfo {

  centreId: string;
  locationId: string;
  name: string;

  deserialize(input: ICentreLocationInfo): this {
    const { centreId, locationId, name } = input;
    Object.assign(this, { centreId, locationId, name });
    return this;
  }

 }
