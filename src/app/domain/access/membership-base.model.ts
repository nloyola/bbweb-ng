import { ConcurrencySafeEntity, EntitySet, HasName, HasSlug, IConcurrencySafeEntity, IEntityInfo } from '@app/domain';
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
