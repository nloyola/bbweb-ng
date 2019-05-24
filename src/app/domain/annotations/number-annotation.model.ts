import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';

export class NumberAnnotation extends Annotation {

  value: number;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType:        this.valueType,
      numberValue:      this.value.toString(10),
      selectedValues:   []
    };
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);
    this.value = +input.numberValue;
    return this;
  }
}
