import { DomainEntity, IDomainEntity } from '@app/domain/domain-entity.model';
import { ValueTypes } from './value-type.enum';
import { MaxValueCount } from './max-value-count.enum';
import { HasDescription } from '../has-description.model';
import { HasName } from '../has-name.model';

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

  isValueTypeSelect() {
    return this.valueType === ValueTypes.Select;
  }

}

export type AnnotationTypeToAdd =
  Pick<AnnotationType, 'name'
  | 'description'
  | 'valueType'
  | 'maxValueCount'
  | 'required'
  | 'options' >;
