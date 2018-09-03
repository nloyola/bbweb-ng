import { DomainEntity } from './domain-entity.model';

export abstract class ConcurrencySafeEntity extends DomainEntity {

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

  /**
   * If the object does not have an ID it is new and is not yet present in the system.
   */
  isNew(): boolean {
    return (this.id === null);
  }

  deserialize(input: any) {
    Object.assign(this, input);
    if (input.timeAdded) {
      this.timeAdded = new Date(input.timeAdded);
    }
    if (input.timeModified) {
      this.timeModified = new Date(input.timeModified);
    }
    return this;
  }

}
