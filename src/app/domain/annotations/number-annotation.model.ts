import { Annotation, IAnnotation } from './annotation.model';

export class NumberAnnotation extends Annotation {
  value: number;

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType: this.valueType,
      numberValue: this.value.toString(10),
      selectedValues: []
    };
  }

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    const numberValue = (input as any).numberValue;
    this.value = numberValue ? +numberValue : null;
    return this;
  }
}
