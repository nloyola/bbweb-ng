import { ConcurrencySafeEntity, EntitySet, HasName, HasSlug, IConcurrencySafeEntity, IEntityInfo, JSONObject } from '@app/domain';
import { ICentreInfoSet } from '@app/domain/centres';
import { IStudyInfoSet } from '@app/domain/studies';

export interface IMembershipBase extends IConcurrencySafeEntity, HasSlug, HasName {
  /**
   * This studies this membership is for.
   */
  studyData: IStudyInfoSet;

  /**
   * This centres this membership is for.
   */
  centreData: ICentreInfoSet;
}

export type IMembershipInfo = IEntityInfo<IMembershipBase>;

export abstract class MembershipBase extends ConcurrencySafeEntity implements HasSlug, HasName {

  slug: string;
  name: string;
  description: string | null;
  studyData: IStudyInfoSet;
  centreData: ICentreInfoSet;

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.studyData) {
      this.studyData = new EntitySet().deserialize(input.studyData as JSONObject);
    }
    if (input.centreData) {
      this.centreData = new EntitySet().deserialize(input.centreData as JSONObject);
    }
    return this;
  }

}
