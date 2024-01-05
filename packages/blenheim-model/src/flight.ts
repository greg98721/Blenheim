import { TimetableFlight } from "./timetableFlight";

export interface Flight {
  flightNumber: string;
  /** ISO format date only */
  date: string;
  emptyFullPriceSeats: number;
  emptyDiscountSeats: number;
  /** NZD */
  fullPrice: number;
  /** NZD */
  discountPrice: number;
  departed?: Date;
  arrived?: Date;
}

export function seatsAvailable(flight: Flight): boolean {
  return flight.emptyFullPriceSeats + flight.emptyDiscountSeats > 0;
}

export function minPrice(flight: Flight): number {
  return flight.emptyDiscountSeats > 0 ? flight.discountPrice : flight.fullPrice;
}

export const maximumBookingDay = 42; // up to 6 weeks out

export const EMPTY_FLIGHT ={
  flightNumber: "",
  date: "",
  emptyFullPriceSeats: 0,
  emptyDiscountSeats: 0,
  fullPrice: 0,
  discountPrice: 0,
  departed: undefined,
  arrived: undefined,
};
