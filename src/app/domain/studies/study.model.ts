import {
  ConcurrencySafeEntity,
  EntityInfoSet,
  HasDescription,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  IEntityInfo,
  IEntityInfoAndState,
  IEntityInfoSet
} from '@app/domain';
import { AnnotationType } from '@app/domain/annotations/annotation-type.model';
import { EntityInfoAndState } from '../entity-info-and-state.model';
import { StudyState } from './study-state.enum';
import { EntityInfoAndState } from '../entity-info-and-state.model';

/**
 * A Study represents a collection of participants and specimens collected for a particular research study.
 */
export interface IStudy extends IConcurrencySafeEntity, HasSlug, HasName, HasDescription {
  /**
   * The annotation types associated with participants of this study.
   */
  annotationTypes: AnnotationType[];

  /**
   * The state can be one of: enabled, disabled, or retired.
   */
  state: StudyState;
}

export class Study extends ConcurrencySafeEntity implements IStudy {
  slug: string;
  name: string;
  description: string | null;
  annotationTypes: AnnotationType[] = [];
  state: StudyState;

  deserialize(input: IStudy): this {
    const { slug, name, state } = input;
    Object.assign(this, { slug, name, state });
    super.deserialize(input);

    if (input.description !== undefined) {
      this.description = input.description;
    }

    if (input.annotationTypes) {
      this.annotationTypes = input.annotationTypes.map(at => new AnnotationType().deserialize(at));
    }
    return this;
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>disabled</code> state.
   */
  isDisabled(): boolean {
    return this.state === StudyState.Disabled;
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>enabled</code> state.
   */
  isEnabled(): boolean {
    return this.state === StudyState.Enabled;
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>retired</code> state.
   */
  isRetired(): boolean {
    return this.state === StudyState.Retired;
  }
}

export type IStudyInfo = IEntityInfo<IStudy>;

export type IStudyInfoSet = IEntityInfoSet<IStudy>;

export type IStudyStateInfo = IEntityInfoAndState<IStudy, StudyState>;

/* tslint:disable-next-line:max-classes-per-file */
export class StudyStateInfo extends EntityInfoAndState<Study, StudyState> {}

/* tslint:disable-next-line:max-classes-per-file */
export class StudyInfoSet extends EntityInfoSet<IStudy, Study> {}
