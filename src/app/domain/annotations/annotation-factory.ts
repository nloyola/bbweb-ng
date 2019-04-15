import { JSONObject } from '@app/domain';
import { Annotation } from './annotation.model';
import { DateTimeAnnotation } from './date-time-annotation.model';
import { NumberAnnotation } from './number-annotation.model';
import { SelectAnnotation } from './select-annotation.model';
import { TextAnnotation } from './text-annotation.model';
import { ValueTypes } from './value-type.enum';

export function annotationFactory(obj: JSONObject): Annotation {
  switch (obj.valueType) {
    case ValueTypes.Text:
      return new TextAnnotation().deserialize(obj);

    case ValueTypes.Number:
      return new NumberAnnotation().deserialize(obj);

    case ValueTypes.DateTime:
      return new DateTimeAnnotation().deserialize(obj);

    case ValueTypes.Select:
      return new SelectAnnotation().deserialize(obj);

    default:
      // do nothing
  }

  // should never happen since this is checked for in the create method, but just in case
  throw new Error('value type is invalid: ' + obj.valueType);
}
