
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  long: number;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  status: 'on-time' | 'delayed' | 'cancelled' | 'landed' | 'in-air';
  aircraft: string;
  distance: number;
}

export interface RouteCategory {
  type: 'short-haul' | 'medium-haul' | 'long-haul';
  color: string;
  description: string;
  minDistance: number; // kilometers
  maxDistance: number; // kilometers
}

export const routeCategories: RouteCategory[] = [
  {
    type: 'short-haul',
    color: '#5BC0EB', // Light blue
    description: 'Flights under 1,500 km',
    minDistance: 0,
    maxDistance: 1500
  },
  {
    type: 'medium-haul',
    color: '#3E92CC', // Medium blue
    description: 'Flights between 1,500 km and 4,000 km',
    minDistance: 1500,
    maxDistance: 4000
  },
  {
    type: 'long-haul',
    color: '#0A2463', // Dark blue
    description: 'Flights over 4,000 km',
    minDistance: 4000,
    maxDistance: Infinity
  }
];

export const airports: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', lat: 40.6413, long: -73.7781 },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', lat: 51.4700, long: -0.4543 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, long: 2.5479 },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, long: 139.7798 },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, long: 151.1753 },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, long: 55.3657 },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, long: 103.9915 },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', lat: 33.9416, long: -118.4085 },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA', lat: 41.9742, long: -87.9073 },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0799, long: 116.6031 },
  { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, long: -46.4731 },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1367, long: 28.2411 }
];

// Generate a random flight between two airports
export function generateRandomFlight(): Flight {
  // Select random airports
  const departureIndex = Math.floor(Math.random() * airports.length);
  let arrivalIndex;
  do {
    arrivalIndex = Math.floor(Math.random() * airports.length);
  } while (arrivalIndex === departureIndex);

  const departureAirport = airports[departureIndex];
  const arrivalAirport = airports[arrivalIndex];
  
  // Calculate distance (simplified)
  const distance = calculateDistance(
    departureAirport.lat, departureAirport.long,
    arrivalAirport.lat, arrivalAirport.long
  );

  // Generate random flight numbers and status
  const airlines = ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'SQ', 'QF'];
  const airline = airlines[Math.floor(Math.random() * airlines.length)];
  const flightNumber = `${airline}${Math.floor(1000 + Math.random() * 9000)}`;
  
  const statuses = ['on-time', 'delayed', 'cancelled', 'landed', 'in-air'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const aircrafts = ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A380', 'Boeing 787'];
  const aircraft = aircrafts[Math.floor(Math.random() * aircrafts.length)];
  
  // Generate departure and arrival times
  const now = new Date();
  const departureTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Random time within 24 hours
  const flightDuration = distance / 800 * 60 * 60 * 1000; // Rough estimate of flight time (800 km/h)
  const arrivalTime = new Date(departureTime.getTime() + flightDuration);
  
  return {
    id: `${flightNumber}-${departureTime.toISOString().split('T')[0]}`,
    airline,
    flightNumber,
    departureAirport,
    arrivalAirport,
    departureTime: departureTime.toISOString(),
    arrivalTime: arrivalTime.toISOString(),
    status,
    aircraft,
    distance
  };
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Classify a flight based on distance
export function classifyFlight(distance: number): RouteCategory {
  return routeCategories.find(
    category => distance >= category.minDistance && distance <= category.maxDistance
  ) || routeCategories[0];
}

// Generate a batch of random flights
export function generateFlights(count: number): Flight[] {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    flights.push(generateRandomFlight());
  }
  return flights;
}
