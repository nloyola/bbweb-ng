import { AnnotationType } from './annotation-type.model';
import { Annotation, IAnnotation } from './annotation.model';
import { DateTimeAnnotation } from './date-time-annotation.model';
import { NumberAnnotation } from './number-annotation.model';
import { SelectAnnotation } from './select-annotation.model';
import { TextAnnotation } from './text-annotation.model';
import { ValueTypes } from './value-type.enum';

export function annotationFromValueType(valueType: ValueTypes): Annotation {
  let annotation: Annotation;

  switch (valueType) {
    case ValueTypes.Text:
      annotation = new TextAnnotation();
      break;

    case ValueTypes.Number:
      annotation = new NumberAnnotation();
      break;

    case ValueTypes.DateTime:
      annotation = new DateTimeAnnotation();
      break;

    case ValueTypes.Select:
      annotation = new SelectAnnotation();
      break;

    default:
      // should never happen since this is checked for in the create method, but just in case
      throw new Error('value type is invalid: ' + valueType);
  }
  annotation.valueType = valueType;
  return annotation;
}

export function annotationFromType(annotationType: AnnotationType): Annotation {
  const annotation = annotationFromValueType(annotationType.valueType);
  annotation.annotationTypeId = annotationType.id;
  annotation.annotationType = annotationType;
  annotation.valueType = annotationType.valueType;
  return annotation;
}

export function annotationFactory(obj: IAnnotation): Annotation {
  const annotation = annotationFromValueType(obj.valueType as ValueTypes);
  return annotation.deserialize(obj);
}
