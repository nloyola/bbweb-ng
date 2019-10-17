import { Deserializable, NamedEntityInfo, INamedEntityInfo, ILocation, Location } from '@app/domain';
import { ICentre, Centre } from './centre.model';

export interface ICentreLocationInfo extends INamedEntityInfo<ICentre> {
  location?: INamedEntityInfo<ILocation>;

  /** the centre's name concatenated with the location name. */
  combinedName?: string;
}

export class CentreLocationInfo extends NamedEntityInfo<Centre>
  implements ICentreLocationInfo, Deserializable {
  location: NamedEntityInfo<Location>;
  combinedName: string;

  deserialize(input: ICentreLocationInfo): this {
    const { combinedName } = input;
    Object.assign(this, { combinedName });
    super.deserialize(input);
    if (input.location) {
      this.location = new NamedEntityInfo().deserialize(input.location);
    }
    return this;
  }
}
