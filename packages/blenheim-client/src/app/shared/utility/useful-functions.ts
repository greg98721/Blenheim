import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function uniqueObjects<T>(array: T[]): T[] {
  const j = array.map(t => JSON.stringify(t));
  const u = [...new Set(j)];
  return u.map(t => JSON.parse(t));
}

/** Generally the magic string enums have 'unknown' as the empty value - check is changed  */
export function notUnknown(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isUnknown = control.value === 'unknown';
    return isUnknown ? { requiresSelection: true } : null;
  };
}
