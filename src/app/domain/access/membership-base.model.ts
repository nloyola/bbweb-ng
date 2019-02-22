import { ConcurrencySafeEntity, EntityInfo, HasSlug, HasName, EntitySet } from '@app/domain';

export abstract class MembershipBase extends ConcurrencySafeEntity implements HasSlug, HasName {

  slug: string;

  /**
   * A short identifying name that is unique.
   */
  name: string;

  /**
   * An optional description that can provide additional details on the name.
   */
  description: string | null;

  /**
   * This studies this membership is for.
   */
  studyData: EntitySet;

  /**
   * This centres this membership is for.
   */
  centreData: EntitySet;

  deserialize(input: any) {
    super.deserialize(input);
    if (input.studyData) {
      this.studyData = new EntitySet().deserialize(input.studyData);
    }
    if (input.centreData) {
      this.centreData = new EntitySet().deserialize(input.centreData);
    }
    return this;
  }

}
