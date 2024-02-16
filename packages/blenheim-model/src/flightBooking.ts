import { Airport } from "./airRoute";
import { Flight } from "./flight";
import { TimetableFlight } from "./timetableFlight";

export type FareType = 'unknown' | 'full' | 'discount';
export type PassengerType = 'unknown' | 'adult' | 'child';


export interface Passenger {
  firstName: string;
  lastName: string;
  passengerType: PassengerType;
}

export interface Ticket {
  firstName: string;
  lastName: string;
  fareType: FareType;
  passengerType: PassengerType;
  price: number;
  seatNumber?: string;
}

export interface BookingBlock {
  /** ISO format date only */
  date: string;
  flightNumber: string;
  origin: Airport;
  /** offset in minutes from the start of the day in the origin timezone */
  departs: number;
  destination: Airport;
  /** offset in minutes from the start of the timetable day in the destination timezone - could be negative for some flights */
  arrives: number;
  tickets: Ticket[];
}

export interface OneWayBooking {
  kind: 'oneWay';
  bookingReference: string;
  purchaserUsername: string;  // all purchasers must be registered users - it is just a test app after all
  details: BookingBlock;
}

export interface ReturnBooking {
  kind: 'return';
  bookingReference: string;
  purchaserUsername: string;  // all purchasers must be registered users - it is just a test app after all
  outboundDetails: BookingBlock;
  returnDetails: BookingBlock;
}

export type FlightBooking = OneWayBooking | ReturnBooking;
