import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';

export class NumberAnnotation extends Annotation {

  value: number;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      numberValue:      this.value,
      selectedValues:   []
    };
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);
    this.value = +input.value;
    return this;
  }
}
