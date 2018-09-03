import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { StudyState } from './study-state.enum';
import { HasSlug } from '@app/domain/has-slug.model';
import { AnnotationType } from '@app/domain/annotations/annotation-type.model';

/*
 * A Study represents a collection of participants and specimens collected for a particular research study.
 */
export class Study extends ConcurrencySafeEntity implements HasSlug {

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
   * The annotation types associated with participants of this study.
   */
  annotationTypes: AnnotationType[] = [];

  /**
   * The state can be one of: enabled, disabled, or retired.
   */
  state: StudyState;

  deserialize(input: any) {
    Object.assign(this, input);
    if (input.annotationTypes) {
      this.annotationTypes = input.annotationTypes
        .map(at => new AnnotationType().deserialize(at));
    }
    return this;
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>disabled</code> state.
   */
  isDisabled(): boolean {
    return (this.state === StudyState.Disabled);
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>enabled</code> state.
   */
  isEnabled(): boolean {
    return (this.state === StudyState.Enabled);
  }

  /**
   * Used to query the study's current state.
   *
   * @returns {boolean} <code>true</code> if the study is in <code>retired</code> state.
   */
  isRetired(): boolean {
    return (this.state === StudyState.Retired);
  }


}
