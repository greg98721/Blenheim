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
  passengerType: PassengerType;
  price: number;
  seatNumber?: string;
}

interface FlightBookingBase {
  kind: 'oneWay' | 'return';
  purchaserUsername: string;  // all purchasers must be registered users - it is just a test app after all
}

export interface OneWayBooking extends FlightBookingBase {
  kind: 'oneWay';
  /** ISO format date only */
  date: string;
  flightNumber: string;
  ticketType: TicketType;
  tickets: Ticket[];
}

export interface ReturnBooking extends FlightBookingBase {
  kind: 'return';
  /** ISO format date only */
  outboundDate: string;
  outboundFlightNumber: string;
  outboundTicketType: TicketType;
  outboundTickets: Ticket[];
  /** ISO format date only */
  inboundDate: string;
  inboundFlightNumber: string;
  inboundTicketType: TicketType;
  inboundTickets: Ticket[];
}

export type FlightBooking = OneWayBooking | ReturnBooking;
