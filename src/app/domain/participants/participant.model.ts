import { ConcurrencySafeEntity, HasSlug, IConcurrencySafeEntity, JSONArray, JSONObject } from '@app/domain';
import { Annotation, annotationFactory, IAnnotation } from '../annotations';

/**
 * The subject for which a set of Specimens were collected from. The subject can be human or
 * non human. A Participant belongs to a single {@link app.domain.studies.Study | Study}.
 */
export interface IParticipant extends IConcurrencySafeEntity, HasSlug {

  /**
   * A Participant has a unique identifier that is used to identify the participant in the system. This
   * identifier is not the same as the <code>id</code> value object used by the domain model.
   */
  uniqueId: string;

  /**
   * The ID of the {@link app.domain.studies.Study|Study} this Participant belongs to.
   */
  studyId: string;

  /**
   * The values of the {@link app.domain.annotations.Annotation|Annotations} collected for this participant.
   */
  annotations: IAnnotation[];
}

export class Participant extends ConcurrencySafeEntity implements IParticipant {

  slug: string;
  uniqueId: string;
  studyId: string;
  annotations: Annotation[];

  deserialize(input: JSONObject) {
    super.deserialize(input);

    if (input.annotations) {
      this.annotations = (input.annotations as JSONArray)
        .map((a: JSONObject) => annotationFactory(a));
    }
    return this;
  }

}
