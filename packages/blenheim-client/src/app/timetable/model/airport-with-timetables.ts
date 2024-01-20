import { Airport, TimetableFlight } from "@blenheim/model";

// Mainly here to keep the resolver and destinations-page in sync

export interface AirportWithTimetables {
  destination: Airport;
  destinationTimetables: TimetableFlight[];
};
