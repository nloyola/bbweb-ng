import { Deserializable } from './deserializable.model';

/**
 * An abstract class for an entity in the domain.
 */
export abstract class DomainEntity implements Deserializable {

  /**
   * The unique ID that identifies an object of this type.
   */
  id: string =  null;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

}
