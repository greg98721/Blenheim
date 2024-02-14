import { Pipe, PipeTransform } from '@angular/core';
import { addMinutes, format } from 'date-fns';

@Pipe({
  name: 'minute',
  standalone: true,
})
export class MinutePipe implements PipeTransform {
  transform(value: number) {
    // we need a date, even though it will disappear when we format it again
    return format(addMinutes(new Date(2023, 1, 1, 0, 0, 0), value), 'p');
  }
}
