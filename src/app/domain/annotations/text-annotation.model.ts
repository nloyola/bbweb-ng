import { Annotation, IAnnotation } from './annotation.model';

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

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    this.value = (input as any).stringValue;
    return this;
  }
}
