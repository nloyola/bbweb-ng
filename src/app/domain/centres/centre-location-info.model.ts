import { Deserializable, EntityInfo, IEntityInfo, ILocation, Location } from '@app/domain';
import { ICentre, Centre } from './centre.model';

export interface ICentreLocationInfo extends IEntityInfo<ICentre> {
  location?: IEntityInfo<ILocation>;

  /** the centre's name concatenated with the location name. */
  combinedName?: string;
}

export class CentreLocationInfo extends EntityInfo<Centre> implements ICentreLocationInfo, Deserializable {
  location: EntityInfo<Location>;
  combinedName: string;

  deserialize(input: ICentreLocationInfo): this {
    const { combinedName } = input;
    Object.assign(this, { combinedName });
    super.deserialize(input);
    if (input.location) {
      this.location = new EntityInfo().deserialize(input.location);
    }
    return this;
  }
}
