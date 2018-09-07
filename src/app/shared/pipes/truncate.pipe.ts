import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {

  transform(input: string, length: number, end = '...') {
    if (!input) {
      return '';
    }

    if (isNaN(length)) {
      length = 10;
    }

    if ((input.length <= length) || (input.length - end.length <= length)) {
      return input;
    }
    return String(input).substring(0, length - end.length) + end;
  }

}
