import { Annotation, IAnnotation } from './annotation.model';

export class DateTimeAnnotation extends Annotation {

  value: Date;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType:        this.valueType,
      stringValue:      this.value.toUTCString(),
      selectedValues:   []
    };
  }

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    const stringValue = (input as any).stringValue;
    this.value = (stringValue) ? new Date(stringValue) : null;
    return this;
  }
}
