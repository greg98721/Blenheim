// We need to create a type guard for airports so we need to do a bit of work - see https://www.qualdesk.com/blog/2021/type-guard-for-string-union-types-typescript/
const AIRPORTS = ['NZAA', 'NZCH', 'NZDN', 'NZHK', 'NZNP', 'NZNR', 'NZNS', 'NZPM', 'NZQN', 'NZTG', 'NZWB', 'NZWN', 'NZCI'] as const;
export type Airport = typeof AIRPORTS[number];
export function isAirport(airport: string): airport is Airport {
  return AIRPORTS.includes(airport as Airport)
}

export function cityName(a: Airport): string {
  switch (a) {
    case 'NZAA': return 'Auckland';
    case 'NZCH': return 'Christchurch';
    case 'NZDN': return 'Dunedin';
    case 'NZHK': return 'Hokitika';
    case 'NZNP': return 'New Plymouth';
    case 'NZNR': return 'Napier';
    case 'NZNS': return 'Nelson';
    case 'NZPM': return 'Palmerston North';
    case 'NZQN': return 'Queenstown';
    case 'NZTG': return 'Tauranga';
    case 'NZWB': return 'Blenheim';
    case 'NZWN': return 'Wellington';
    case 'NZCI': return 'Chatham Islands'
  }
}

export function timezone(airport: Airport): string {
  if (airport === 'NZCI') {
    return 'Pacific/Chatham';
  } else {
    return 'Pacific/Auckland';
  }
}

/** should be route but want to avoid any mix up with angular routing */
export interface AirRoute {
  origin: Airport;
  destination: Airport;
}
