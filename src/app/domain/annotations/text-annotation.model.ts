import { Annotation, IAnnotation } from './annotation.model';

export class TextAnnotation extends Annotation {
  value: string;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType: this.valueType,
      stringValue: this.value,
      selectedValues: []
    };
  }

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    const stringValue = (input as any).stringValue;
    this.value = stringValue ? stringValue : null;
    return this;
  }
}
