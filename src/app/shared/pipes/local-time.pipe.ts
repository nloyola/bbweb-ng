import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { AppSettings } from '@app/app-settings';

@Pipe({ name: 'localTime' })
export class LocalTimePipe implements PipeTransform {
  transform(input: Date, format: string) {
    if (!input) {
      return '';
    }
    if (!format) {
      format = AppSettings.DATE_FORMAT;
    }

    return formatDate(input, format, 'en_CA');
  }
}
