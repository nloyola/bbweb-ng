import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nlToBr' })
export class NlToBrPipe implements PipeTransform {
  transform(input: string) {
    if (!input) {
      return input;
    }
    const lines = input.split('\n');

    const span = document.createElement('span');
    for (let i = 0; i < lines.length; i++) {
      span.innerText = lines[i];
      span.textContent = lines[i];
      lines[i] = span.innerHTML;
    }
    return lines.join('<br />');
  }
}
