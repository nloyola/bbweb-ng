import { HasDescription, HasName, HasSlug, JSONObject } from '@app/domain';
import { AnnotationType } from '@app/domain/annotations';
import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { InputSpecimenProcessing } from './input-specimen-processing.model';
import { OutputSpecimenProcessing } from './output-specimen-processing.model';
import { ProcessingTypeInputEntity } from './processing-type-input-entity.model';
import { JSONArray } from '../json-object.model';

export interface IProcessingType
extends ConcurrencySafeEntity, ProcessingTypeInputEntity, HasSlug, HasName, HasDescription {

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

  deserialize(obj: JSONObject) {
    super.deserialize(obj);

    if (obj.description === undefined) {
      this.description = undefined;
    }

    if (obj.annotationTypes) {
      this.annotationTypes = (obj.annotationTypes as JSONArray)
        .map((at: JSONObject) => new AnnotationType().deserialize(at));
    }

    if (obj.specimenProcessing) {
      const jObj = obj.specimenProcessing as JSONObject;
      if (jObj.input) {
        this.input = new InputSpecimenProcessing().deserialize(jObj.input as JSONObject);
      }
      if (jObj.output) {
        this.output = new OutputSpecimenProcessing().deserialize(jObj.output as JSONObject);
      }
    }

    return this;
  }

}
