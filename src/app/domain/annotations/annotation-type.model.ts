import { DomainEntity } from '@app/domain/domain-entity.model';
import { ValueTypes } from './value-type.enum';
import { MaxValueCount } from './max-value-count.enum';

export class AnnotationType extends DomainEntity {

  /**
   * A short identifying name that is unique.
   */
  name: string;

  /**
   * An optional description that can provide additional details on the name.
   */
  description: string | null;

  /**
   * The type of information stored by the annotation.
   */
  valueType: ValueTypes;

  /**
   * When `valueType` is {@link domain.AnnotationValueType.SELECT}, this is the number of items allowed to be
   * selected. If the value is greater than 1 then any number of values can be selected.
   */
  maxValueCount: MaxValueCount;

  /**
   * When true, the user must enter a value for this annotation.
   */
  required: boolean;

  /**
   * When `valueType` is {@link domain.AnnotationValueType.SELECT}, these are the values allowed to be
   */
  options: string[];

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }

  valueTypeToLabel() {
    if (this.valueType === ValueTypes.Select) {
      if (this.maxValueCount === undefined) {
        return ValueTypes.Select;
      } else  if (this.maxValueCount === 1) {
        return 'Single Select';
      }
      return 'Multiple Select';
    }

    return this.valueType;
  }

}
