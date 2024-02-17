import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { parse, isValid } from 'date-fns';

export const dateAsTextValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = control.value;
  if (v && typeof v === 'string') {
    try {
      const d = parse(v, 'P', new Date());
      if (!isValid(d)) {
        return { dateAsTextError: true };
      }
    } catch (e) {
      return { dateAsTextError: true };
    }
  } else {
    return { dateAsTextError: true };
  }
  return null;
}
