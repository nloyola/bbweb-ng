import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'localTime' })
export class LocalTimePipe implements PipeTransform {
  transform(input: Date, format: string) {
    if (!input) {
      return '';
    }
    if (!format) {
      format = 'shortDate';
    }

    return formatDate(input, format, 'en_CA');
  }
}
