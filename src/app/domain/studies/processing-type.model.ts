import { HasDescription, HasName, HasSlug, JSONObject } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { InputSpecimenProcessing } from './input-specimen-processing.model';
import { OutputSpecimenProcessing } from './output-specimen-processing.model';
import { ProcessingTypeInputEntity } from './processing-type-input-entity.model';
import { JSONArray } from '../json-object.model';

export interface IProcessingType
  extends ConcurrencySafeEntity,
    ProcessingTypeInputEntity,
    HasSlug,
    HasName,
    HasDescription {
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
  annotationTypes: AnnotationType[];

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
}

export class ProcessingType extends ConcurrencySafeEntity implements IProcessingType {
  slug: string;
  name: string;
  description: string | null;
  enabled: boolean;
  studyId: string;
  annotationTypes: AnnotationType[] = [];
  input: InputSpecimenProcessing;
  output: OutputSpecimenProcessing;
  inUse: boolean;

  constructor() {
    super();
    this.annotationTypes = [];
    this.input = new InputSpecimenProcessing();
    this.output = new OutputSpecimenProcessing();
  }

  deserialize(obj: IProcessingType): this {
    const { slug, name, enabled, studyId, inUse } = obj;
    Object.assign(this, { slug, name, enabled, studyId, inUse });
    super.deserialize(obj);

    if (obj.description !== undefined) {
      this.description = obj.description;
    }

    if (obj.annotationTypes) {
      this.annotationTypes = obj.annotationTypes.map(at => new AnnotationType().deserialize(at));
    }

    const specimenProcessing = (obj as any).specimenProcessing;
    const input = specimenProcessing && specimenProcessing.input ? specimenProcessing.iput : obj.input;
    const output = specimenProcessing && specimenProcessing.output ? specimenProcessing.iput : obj.output;

    if (input) {
      this.input = new InputSpecimenProcessing().deserialize(input);
    }

    if (output) {
      this.output = new OutputSpecimenProcessing().deserialize(output);
    }

    return this;
  }
}
