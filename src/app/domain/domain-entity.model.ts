import { Deserializable } from './deserializable.model';
import { JSONObject } from './json-object.model';

export interface IDomainEntity {

  /**
   * The unique ID that identifies an object of this type.
   */
  id: string;

}

/**
 * An abstract class for an entity in the domain.
 */
export abstract class DomainEntity implements IDomainEntity, Deserializable {

  id: string = null;

  /**
   * If the object does not have an ID it is new and is not yet present in the system.
   */
  isNew(): boolean {
    return (this.id === undefined) || (this.id === null);
  }

  deserialize(input: JSONObject) {
    Object.assign(this, input);
    return this;
  }

}
