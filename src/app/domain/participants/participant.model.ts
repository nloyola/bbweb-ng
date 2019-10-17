import {
  applyMixins,
  ConcurrencySafeEntity,
  NamedEntityInfo,
  HasSlug,
  IConcurrencySafeEntity,
  EntityInfo
} from '@app/domain';
import {
  Annotation,
  AnnotationType,
  HasAnnotations,
  IAnnotation,
  AnnotationFactory
} from '@app/domain/annotations';
import { IStudyInfo, Study, StudyInfo } from '@app/domain/studies';

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
   * Information for the {@link app.domain.studies.Study|Study} this Participant belongs to.
   */
  study: IStudyInfo;

  /**
   * The values of the {@link app.domain.annotations.Annotation|Annotations} collected for this participant.
   */
  annotations: IAnnotation[];
}

export class Participant extends ConcurrencySafeEntity implements IParticipant, HasAnnotations {
  slug: string;
  uniqueId: string;
  study: NamedEntityInfo<Study>;
  studyEntity: Study;

  annotations: Annotation[];
  setAnnotationTypes: (at: AnnotationType[]) => void;

  setStudy(s: Study) {
    this.study.id = s.id;
    this.study.slug = s.slug;
    this.study.name = s.name;
    this.studyEntity = s;
    this.setAnnotationTypes(s.annotationTypes);
  }

  deserialize(input: IParticipant): this {
    const { slug, uniqueId } = input;
    Object.assign(this, { slug, uniqueId });
    super.deserialize(input);
    this.study = new StudyInfo().deserialize(input.study);

    if (input.annotations) {
      this.annotations = input.annotations.map(a => {
        if (a instanceof Annotation) {
          return a;
        }
        // it is a plain object then
        return AnnotationFactory.annotationFactory(a);
      });
    }
    return this;
  }
}

applyMixins(Participant, [HasAnnotations]);

export type IParticipantInfo = Pick<Participant, 'id' | 'slug' | 'uniqueId'>;

/* tslint:disable-next-line:max-classes-per-file */

export class ParticipantInfo extends EntityInfo<Participant> implements IParticipantInfo {
  uniqueId: string;

  deserialize(input: IParticipantInfo): this {
    const { uniqueId } = input;
    Object.assign(this, { uniqueId });
    super.deserialize(input);
    return this;
  }
}
