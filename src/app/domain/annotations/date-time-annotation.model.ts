import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';

export class DateTimeAnnotation extends Annotation {

  value: Date;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      stringValue:      this.value.toUTCString(),
      selectedValues:   []
    };
  }

  deserialize(input: JSONObject) {
    super.deserialize(input);

    if (input.stringValue) {
      this.value = new Date(input.stringValue as string);
    }
    return this;
  }
}
