import { Annotation, IAnnotation } from './annotation.model';
import { formatDate } from '@angular/common';
import { AppSettings } from '@app/app-settings';

export class DateTimeAnnotation extends Annotation {
  value: Date;

  displayValue(): string {
    if (this.value === undefined) {
      return undefined;
    }
    return formatDate(this.value, AppSettings.DATE_FORMAT, 'en_CA');
  }

  serverAnnotation(): any {
    return {
      annotationTypeId: this.annotationTypeId,
      valueType: this.valueType,
      stringValue: this.value.toUTCString(),
      selectedValues: []
    };
  }

  deserialize(input: IAnnotation): this {
    super.deserialize(input);
    const stringValue = (input as any).stringValue;
    this.value = stringValue ? new Date(stringValue) : null;
    return this;
  }
}
