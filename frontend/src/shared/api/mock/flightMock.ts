export type FlightMock = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
  baggageIncluded: boolean;
  stopsCount: number;
};

export const flightsMock: FlightMock[] = [
  {
    id: 'flight-1',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 8200,
    duration: 95,
    airline: 'Аэрофлот',
    departureTime: '08:30',
    arrivalTime: '10:05',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
  {
    id: 'flight-2',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 7600,
    duration: 105,
    airline: 'Победа',
    departureTime: '12:10',
    arrivalTime: '13:55',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: false,
    stopsCount: 0,
  },
  {
    id: 'flight-3',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-02',
    price: 9100,
    duration: 100,
    airline: 'Россия',
    departureTime: '15:40',
    arrivalTime: '17:20',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
  {
    id: 'flight-4',
    origin: 'dme',
    destination: 'led',
    date: '2026-05-02',
    price: 8700,
    duration: 110,
    airline: 'S7 Airlines',
    departureTime: '19:00',
    arrivalTime: '20:50',
    originAirport: 'Домодедово',
    destinationAirport: 'Пулково',
    baggageIncluded: true,
    stopsCount: 0,
  },
];
