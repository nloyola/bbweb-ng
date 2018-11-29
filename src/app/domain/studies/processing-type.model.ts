import { HasDescription, HasName, HasSlug } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { InputSpecimenProcessing } from './input-specimen-processing.model';
import { OutputSpecimenProcessing } from './output-specimen-processing.model';
import { ProcessingTypeInputEntity } from './processing-type-input-entity.model';

export class ProcessingType extends ConcurrencySafeEntity implements ProcessingTypeInputEntity, HasSlug, HasName, HasDescription {

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
   * When TRUE input specimens can be processed for this study.
   */
  enabled: boolean;

  /**
   * The ID of the {@link Study} this processing type belongs to.
   */
  studyId: string;

  /**
   * The annotation that are collected for this processing type.
   */
  annotationTypes: AnnotationType[] = [];

  /**
   * The input specimen processing information for this processing type.
   */
  input: InputSpecimenProcessing;

  /**
   * The output specimen processing information for this processing type.
   */
  output: OutputSpecimenProcessing;

  /**
   * TRUE when the specimen in this processing type is the input in a different processing type.
   */
  inUse: boolean;

  constructor() {
    super();
    this.annotationTypes = [];
    this.input = new InputSpecimenProcessing();
    this.output = new OutputSpecimenProcessing();
  }

  deserialize(obj: any) {
    super.deserialize(obj);

    if (obj.description === undefined) {
      this.description = undefined;
    }

    if (obj.annotationTypes) {
      this.annotationTypes = obj.annotationTypes
        .map(at => new AnnotationType().deserialize(at));
    }

    if (obj.specimenProcessing) {
      if (obj.specimenProcessing.input) {
        this.input = new InputSpecimenProcessing().deserialize(obj.specimenProcessing.input);
      }
      if (obj.specimenProcessing.output) {
        this.output = new OutputSpecimenProcessing().deserialize(obj.specimenProcessing.output);
      }
    }

    return this;
  }

}

export type ProcessingTypeToAdd =
  Pick<ProcessingType, 'name' | 'description' | 'enabled' | 'studyId' | 'input' | 'output' >;
