import { getDay } from 'date-fns/fp';   // Note using the functional version of the date-fns library

import { AirRoute } from './airRoute';

export type Aircraft = 'ATR42' | 'A220-100';
export function capacity(aircraft: Aircraft) { return aircraft === 'ATR42' ? 50 : 110 }

export interface TimetableFlight {
  route: AirRoute;
  aircraft: Aircraft;
  /** Should be unique in each day */
  flightNumber: string;
  /** offset in minutes from the start of the day in the origin timezone */
  departs: number;
  /** offset in minutes from the start of the timetable day in the destination timezone - could be negative for some flights */
  arrives: number;
  /** a 7 bit array - see days below */
  days: number;
}

export const SUNDAY = 0x01;
export const MONDAY = 0x02;
export const TUESDAY = 0x04;
export const WEDNESDAY = 0x08;
export const THURSDAY = 0x10;
export const FRIDAY = 0x20;
export const SATURDAY = 0x40;
export const WEEKDAYS = MONDAY + TUESDAY + WEDNESDAY + THURSDAY + FRIDAY;
export const WEEKEND = SUNDAY + SATURDAY;

export function getTimetableDayFromDate(d: Date): number {
  switch (getDay(d)) {
    case 0: return SUNDAY;
    case 1: return MONDAY;
    case 2: return TUESDAY;
    case 3: return WEDNESDAY;
    case 4: return THURSDAY;
    case 5: return FRIDAY;
    case 6: return SATURDAY;
    default: throw new Error('Invalid day');
  }
}
