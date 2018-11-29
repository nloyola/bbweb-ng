import { HasDescription, HasName, HasSlug } from '@app/domain';
import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { AnnotationType } from '@app/domain/annotations';
import { CollectedSpecimenDefinition } from './collected-specimen-definition.model';
import { ProcessingTypeInputEntity } from '.';

export class CollectionEventType extends ConcurrencySafeEntity implements ProcessingTypeInputEntity, HasSlug, HasName, HasDescription {

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
  annotationTypes: AnnotationType[] = [];

  /**
   * The definitions of the specimens that are collected for this collection event type.
   */
   specimenDefinitions: CollectedSpecimenDefinition[];

  deserialize(input: any) {
    super.deserialize(input);

    if (input.description === undefined) {
      this.description = undefined;
    }

    if (input.annotationTypes) {
      this.annotationTypes = input.annotationTypes
        .map((at: AnnotationType) => new AnnotationType().deserialize(at));
    }

    if (input.specimenDefinitions) {
      this.specimenDefinitions = input.specimenDefinitions
        .map((sd: CollectedSpecimenDefinition) => new CollectedSpecimenDefinition().deserialize(sd));
    }

    return this;
  }

}

export type CollectionEventTypeToAdd =
  Pick<CollectionEventType, 'name' | 'description' | 'recurring' | 'studyId' >;
