import { JSONArray, HasDescription, HasName, HasSlug, JSONObject } from '@app/domain';
import { ConcurrencySafeEntity, IConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { AnnotationType, IAnnotationType } from '@app/domain/annotations';
import { ProcessingTypeInputEntity } from './processing-type-input-entity.model';
import { CollectedSpecimenDefinition } from './collected-specimen-definition.model';

export interface ICollectionEventType
extends IConcurrencySafeEntity, ProcessingTypeInputEntity, HasSlug, HasName, HasDescription {

  /**
   * True if collection events of this type occur more than once for the duration of the study.
   */
  recurring: boolean;

  /**
   * The ID of the {@link Study} this collection event type belongs to.
   */
  studyId: string;

  /**
   * The annotation types associated with participants of this study.
   */
  annotationTypes: IAnnotationType[];

  /**
   * The definitions of the specimens that are collected for this collection event type.
   */
   specimenDefinitions: CollectedSpecimenDefinition[];

}

export class CollectionEventType extends ConcurrencySafeEntity implements ICollectionEventType {

  slug: string;
  name: string;
  description: string | null;
  recurring: boolean;
  studyId: string;
  annotationTypes: AnnotationType[] = [];
  specimenDefinitions: CollectedSpecimenDefinition[];

  deserialize(input: JSONObject) {
    super.deserialize(input);

    if (input.description === undefined) {
      this.description = undefined;
    }

    if (input.annotationTypes) {
      this.annotationTypes = (input.annotationTypes as JSONArray)
        .map((at: JSONObject) => new AnnotationType().deserialize(at));
    }

    if (input.specimenDefinitions) {
      this.specimenDefinitions = (input.specimenDefinitions as JSONArray)
        .map((sd: JSONObject) => new CollectedSpecimenDefinition().deserialize(sd));
    }

    return this;
  }

}
