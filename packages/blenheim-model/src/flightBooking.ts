import { Flight } from "./flight";
import { TimetableFlight } from "./timetableFlight";

export type TicketType = 'unknown' | 'full' | 'discount';
export type PassengerType = 'unknown' | 'adult' | 'child';


export interface Passenger {
  firstName: string;
  surname: string;
  passengerType: PassengerType;
}

export interface Ticket {
  firstName: string;
  surname: string;
  ticketType: TicketType;
  passengerType: PassengerType;
  price: number;
  seatNumber?: string;
}

export interface BookingBlock {
  /** ISO format date only */
  date: string;
  flightNumber: string;
  tickets: Ticket[];
}

export interface OneWayBooking {
  kind: 'oneWay';
  purchaserUsername: string;  // all purchasers must be registered users - it is just a test app after all
  details: BookingBlock;
}

export interface ReturnBooking {
  kind: 'return';
  purchaserUsername: string;  // all purchasers must be registered users - it is just a test app after all
  outboundDetails: BookingBlock;
  returnDetails: BookingBlock;
}

export type FlightBooking = OneWayBooking | ReturnBooking;
