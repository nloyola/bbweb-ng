import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';

export class TextAnnotation extends Annotation {

  value: string;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType:        this.valueType,
      stringValue:      this.value,
      selectedValues:   []
    };
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);
    this.value = input.stringValue as string;
    return this;
  }
}
