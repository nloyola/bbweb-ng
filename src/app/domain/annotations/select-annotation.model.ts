import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';
import { JSONArray } from '../json-object.model';

export class SelectAnnotation extends Annotation {

  value: string[];

  serverAnnotation() {
    return {
      annotationTypeId: this.annotationTypeId,
      selectedValues:   this.value
    };
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);
    this.value = (input.selectedValues as JSONArray).map(v => v as string);
    return this;
  }
}
