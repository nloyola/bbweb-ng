import { Annotation, IAnnotation } from './annotation.model';

export class SelectAnnotation extends Annotation {
  value: string[] = [];

  displayValue(): string {
    return this.value.join(', ');
  }

  serverAnnotation() {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType: this.valueType,
      selectedValues: this.value
    };
  }

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    this.value = (input as any).selectedValues;
    return this;
  }
}
