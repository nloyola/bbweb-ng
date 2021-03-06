import { DomainEntity, IDomainEntity } from './domain-entity.model';
import { JSONObject } from './json-object.model';

export interface IConcurrencySafeEntity extends IDomainEntity {

  /**
   * The current version for the object. Used for optimistic concurrency versioning.
   */
  version: number;

  /**
   * The date and time, in ISO time format, when this entity was added to the system.
   */
  timeAdded: Date;

  /**
   * The date and time, in ISO time format, when this entity was last updated.
   */
  timeModified: Date | null;

}

export abstract class ConcurrencySafeEntity extends DomainEntity implements IConcurrencySafeEntity {

  version: number;
  timeAdded: Date;
  timeModified: Date | null;

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.timeAdded) {
      this.timeAdded = new Date(input.timeAdded as string);
    }
    if (input.timeModified) {
      this.timeModified = new Date(input.timeModified as string);
    }
    return this;
  }

}
