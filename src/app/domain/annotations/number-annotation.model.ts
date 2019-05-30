import { Annotation, IAnnotation } from './annotation.model';

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

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    const numberValue = (input as any).numberValue;
    if (numberValue) {
      this.value = +numberValue;
    }
    return this;
  }
}
