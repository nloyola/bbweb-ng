import {
  ConcurrencySafeEntity,
  EntitySet,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  IEntityInfo,
  JSONObject
} from '@app/domain';
import { ICentreInfoSet, CentreInfoSet } from '@app/domain/centres';
import { IStudyInfoSet, StudyInfoSet } from '@app/domain/studies';
import { HasDescription } from '../has-description.model';

export interface IMembershipBase extends IConcurrencySafeEntity, HasSlug, HasName, HasDescription {
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
  studyData: StudyInfoSet;
  centreData: CentreInfoSet;

  deserialize(input: IMembershipBase): this {
    const { slug, name } = input;
    Object.assign(this, { slug, name });
    super.deserialize(input);

    if (input.description) {
      this.description = input.description;
    }

    if (input.studyData) {
      this.studyData = new EntitySet().deserialize(input.studyData);
    }
    if (input.centreData) {
      this.centreData = new EntitySet().deserialize(input.centreData);
    }
    return this;
  }
}
