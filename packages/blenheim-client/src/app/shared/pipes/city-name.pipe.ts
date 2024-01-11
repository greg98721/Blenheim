import { Pipe, PipeTransform } from '@angular/core';
import { Airport, cityName, isAirport, TimetableFlight } from '@marlborough/model';

@Pipe({
  name: 'cityName',
  standalone: true,
})
export class CityNamePipe implements PipeTransform {
  transform(value?: string) {
    if (value && isAirport(value)) {
      return cityName(value);
    } else {
      return '';
    }
}
}
