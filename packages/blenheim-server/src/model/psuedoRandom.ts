import { alea, PRNG } from 'seedrandom';

/** Wrapper to simplyfy use of seedable random number generator.
 * Math.random() cannot be manually seeded so will not be repeatable, hence using seedrandom library.
 */
export class PsuedoRandom {
  readonly prng: PRNG;
  constructor(_seed: string) {
    this.prng = alea(_seed);
  }

  withinPrecent(pc: number): boolean {
    return this.prng.double() < pc / 100.0;
  }

  flat(min: number, max: number): number {
    return this.prng.double() * (max - min) + min;
  }

  flatInt(min: number, max: number): number {
    return Math.round(this.flat(min, max));
  }

  gaussian(min: number, max: number): number {
    return randn_bm(this.prng, min, max, 1.0);
  }

  nextSeed(): string {
    return `${this.prng.int32()}`;
  }
}

/** Nornalised random number algorithm from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve */
function randn_bm(prng: PRNG, min: number, max: number, skew: number) {
  let u = 0;
  let v = 0;
  while (u === 0) {
    u = prng.double(); //Converting [0,1) to (0,1)
  }
  while (v === 0) {
    v = prng.double();
  }
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = randn_bm(prng, min, max, skew); // resample between 0 and 1 if out of range
  } else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}
