import {
  startOfDay,
  endOfDay
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

function calculateInTimezone(fn: (dt: Date) => Date, timezone: string, d: Date): Date {
  const u = d.getTime();
  const z = utcToZonedTime(u, timezone);
  const r = fn(z);
  return r;
}

export function startOfDayInTimezone(timezone: string, d: Date): Date {
  const u = d.getTime();
  const z = utcToZonedTime(u, timezone);
  const r = startOfDay(z);
  return r;
}

export function endOfDayInTimezone(timezone: string, d: Date): Date {
  const u = d.getTime();
  const z = utcToZonedTime(u, timezone);
  const r = endOfDay(z);
  return r;
}

export function toTimezone(timezone: string, d: Date): Date {
  return utcToZonedTime(d, timezone);
}
