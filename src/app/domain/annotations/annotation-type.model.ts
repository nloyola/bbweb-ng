import { DomainEntity, HasDescription, HasName, IDomainEntity, JSONObject } from '@app/domain';
import { MaxValueCount } from './max-value-count.enum';
import { ValueTypes } from './value-type.enum';

export interface IAnnotationType extends IDomainEntity, HasName, HasDescription {

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

}

export class AnnotationType extends DomainEntity implements IAnnotationType {

  name: string;
  description: string | null;
  valueType: ValueTypes;
  maxValueCount: MaxValueCount;
  required: boolean;
  options: string[];

  static sortAnnotationTypes(annotationTypes: AnnotationType[]): AnnotationType[] {
    const sortedAnnotationTypes = annotationTypes.slice(0);
    sortedAnnotationTypes.sort((a: AnnotationType, b: AnnotationType): number => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
    return sortedAnnotationTypes;
  }

  deserialize(input: IAnnotationType): this {
    const { name, valueType, maxValueCount, required, options } = input;
    Object.assign(this, { name, valueType, maxValueCount, required, options });
    if (input.description !== undefined) {
      this.description = input.description;
    }
    super.deserialize(input);
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

  isValueTypeSelect() {
    return this.valueType === ValueTypes.Select;
  }

  isSingleSelect() {
    return (this.valueType === ValueTypes.Select) && (this.maxValueCount === 1);
  }

  isMultipleSelect() {
    return (this.valueType === ValueTypes.Select) && (this.maxValueCount !== 1);
  }

}
