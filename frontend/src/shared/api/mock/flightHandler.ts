import { http, HttpResponse } from 'msw';

type FlightStop = {
  airport: string;
  city: string;
  code: string;
  durationMinutes: number;
  legDurationMinutes: number;
  legAirline?: string;
};

type SeatsPerClass = { economy: number; comfort: number; business: number; first: number };

type FlightMock = {
  id: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  originalPrice: number;
  duration: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
  originCity: string;
  destinationCity: string;
  baggageIncluded: boolean;
  baggageWeight: number;
  stopsCount: number;
  stops?: FlightStop[];
  seatsLeft: SeatsPerClass;    // seats for the default fare
  seatsLeftAlt: SeatsPerClass; // seats for the alternative fare (baggage ↔ no-baggage)
};

const flightsMock: FlightMock[] = [
  {
    id: 'flight-1',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 8200,
    originalPrice: 14000,
    duration: 95,
    airline: 'Аэрофлот',
    departureTime: '08:30',
    arrivalTime: '10:05',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 3, comfort: 8,  business: 12, first: 2 },
    seatsLeftAlt: { economy: 7, comfort: 5,  business: 10, first: 0 }, // no-baggage fare: more economy, no first
  },
  {
    id: 'flight-2',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 7600,
    originalPrice: 13000,
    duration: 105,
    airline: 'Победа',
    departureTime: '12:10',
    arrivalTime: '13:55',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 0,
    seatsLeft:    { economy: 8,  comfort: 12, business: 15, first: 0 },
    seatsLeftAlt: { economy: 2,  comfort: 5,  business: 8,  first: 0 }, // with-baggage fare: much fewer seats
  },
  {
    id: 'flight-3',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 9500,
    originalPrice: 16000,
    duration: 100,
    airline: 'Россия',
    departureTime: '17:00',
    arrivalTime: '18:40',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 15,
    stopsCount: 0,
    seatsLeft:    { economy: 2, comfort: 6, business: 9, first: 1 },
    seatsLeftAlt: { economy: 0, comfort: 2, business: 5, first: 0 }, // no-baggage: economy sold out!
  },
  {
    id: 'flight-11',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 10500,
    originalPrice: 17500,
    duration: 90,
    airline: 'S7 Airlines',
    departureTime: '21:30',
    arrivalTime: '23:00',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 5, comfort: 9,  business: 14, first: 3 },
    seatsLeftAlt: { economy: 3, comfort: 7,  business: 12, first: 2 },
  },
  {
    id: 'flight-12',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 5900,
    originalPrice: 11000,
    duration: 330,
    airline: 'Уральские авиалинии',
    departureTime: '06:15',
    arrivalTime: '11:45',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 1,
    seatsLeft:    { economy: 1, comfort: 3, business: 6, first: 0 },
    seatsLeftAlt: { economy: 5, comfort: 2, business: 4, first: 0 }, // with-baggage: more economy seats
    stops: [
      {
        airport: 'Кольцово',
        city: 'Екатеринбург',
        code: 'SVX',
        durationMinutes: 75,
        legDurationMinutes: 150, // SVO → SVX (Уральские авиалинии)
        legAirline: 'Победа',   // SVX → LED operated by Победа
      },
    ],
  },
  {
    id: 'flight-4',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-02',
    price: 9100,
    originalPrice: 15500,
    duration: 100,
    airline: 'Россия',
    departureTime: '15:40',
    arrivalTime: '17:20',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 15,
    stopsCount: 0,
    seatsLeft:    { economy: 4, comfort: 8, business: 11, first: 2 },
    seatsLeftAlt: { economy: 6, comfort: 4, business: 9,  first: 0 },
  },
  {
    id: 'flight-5',
    origin: 'dme',
    destination: 'led',
    date: '2026-05-02',
    price: 8700,
    originalPrice: 14500,
    duration: 110,
    airline: 'S7 Airlines',
    departureTime: '19:00',
    arrivalTime: '20:50',
    originAirport: 'Домодедово',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 7, comfort: 11, business: 14, first: 0 },
    seatsLeftAlt: { economy: 4, comfort: 8,  business: 10, first: 0 },
  },
  {
    id: 'flight-6',
    origin: 'svo',
    destination: 'led',
    date: '2026-04-28',
    price: 11200,
    originalPrice: 18000,
    duration: 95,
    airline: 'Аэрофлот',
    departureTime: '06:00',
    arrivalTime: '07:35',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 2, comfort: 6, business: 9, first: 1 },
    seatsLeftAlt: { economy: 1, comfort: 4, business: 7, first: 0 },
  },
  {
    id: 'flight-7',
    origin: 'svo',
    destination: 'led',
    date: '2026-04-29',
    price: 9800,
    originalPrice: 16500,
    duration: 100,
    airline: 'Победа',
    departureTime: '10:20',
    arrivalTime: '12:00',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 0,
    seatsLeft:    { economy: 6,  comfort: 10, business: 15, first: 0 },
    seatsLeftAlt: { economy: 3,  comfort: 6,  business: 10, first: 0 },
  },
  {
    id: 'flight-8',
    origin: 'svo',
    destination: 'led',
    date: '2026-04-30',
    price: 8900,
    originalPrice: 15000,
    duration: 95,
    airline: 'S7 Airlines',
    departureTime: '14:45',
    arrivalTime: '16:20',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 3, comfort: 8,  business: 12, first: 2 },
    seatsLeftAlt: { economy: 4, comfort: 5,  business: 8,  first: 1 },
  },
  {
    id: 'flight-9',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-03',
    price: 7200,
    originalPrice: 12500,
    duration: 95,
    airline: 'Победа',
    departureTime: '08:00',
    arrivalTime: '09:35',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 0,
    seatsLeft:    { economy: 9, comfort: 13, business: 16, first: 0 },
    seatsLeftAlt: { economy: 4, comfort: 7,  business: 10, first: 0 },
  },
  {
    id: 'flight-10',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-04',
    price: 8400,
    originalPrice: 14200,
    duration: 105,
    airline: 'Аэрофлот',
    departureTime: '20:15',
    arrivalTime: '21:55',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 4, comfort: 8, business: 11, first: 1 },
    seatsLeftAlt: { economy: 2, comfort: 6, business: 8,  first: 0 },
  },

  // ── Test flights for discount display rules (2026-05-03) ──────────────────
  {
    // No discount, price < 10 000 → should show lone flame only
    id: 'flight-13',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 7800,
    originalPrice: 7800,
    duration: 95,
    airline: 'Россия',
    departureTime: '13:20',
    arrivalTime: '14:55',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 0,
    seatsLeft:    { economy: 5, comfort: 9,  business: 14, first: 1 },
    seatsLeftAlt: { economy: 3, comfort: 8,  business: 12, first: 0 },
  },
  {
    // No discount, price ≥ 10 000 → should show nothing (no badge, no flame, no crossed price)
    id: 'flight-14',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 12000,
    originalPrice: 12000,
    duration: 90,
    airline: 'S7 Airlines',
    departureTime: '16:45',
    arrivalTime: '18:15',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: true,
    baggageWeight: 23,
    stopsCount: 0,
    seatsLeft:    { economy: 7, comfort: 10, business: 13, first: 2 },
    seatsLeftAlt: { economy: 2, comfort: 5,  business: 8,  first: 0 },
  },
  {
    // ~11 % discount → should show crossed price + badge, but NO flame
    id: 'flight-15',
    origin: 'svo',
    destination: 'led',
    date: '2026-05-01',
    price: 9000,
    originalPrice: 10100,
    duration: 100,
    airline: 'Уральские авиалинии',
    departureTime: '19:30',
    arrivalTime: '21:10',
    originAirport: 'Шереметьево',
    destinationAirport: 'Пулково',
    originCity: 'Москва',
    destinationCity: 'Санкт-Петербург',
    baggageIncluded: false,
    baggageWeight: 10,
    stopsCount: 0,
    seatsLeft:    { economy: 4, comfort: 7,  business: 11, first: 0 },
    seatsLeftAlt: { economy: 1, comfort: 5,  business: 9,  first: 0 },
  },
];

const getPassengerMultiplier = (url: URL) => {
  const adults = Number(url.searchParams.get('passengers_adults') ?? 1);
  const children = Number(url.searchParams.get('passengers_children') ?? 0);
  const toddler = Number(url.searchParams.get('passengers_toddler') ?? 0);

  return adults + children * 0.75 + toddler * 0.1;
};

const isDateInRange = (date: string, dateFrom: string, dateTo: string) => {
  return date >= dateFrom && date <= dateTo;
};

export const flightHandlers = [
  http.get('/api/flights/best-prices', ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');

    if (!origin || !destination || !dateFrom || !dateTo) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengerMultiplier = getPassengerMultiplier(url);

    const filteredFlights = flightsMock.filter((flight) => {
      return (
        flight.origin === origin &&
        flight.destination === destination &&
        isDateInRange(flight.date, dateFrom, dateTo)
      );
    });

    const pricesByDate = filteredFlights.reduce<Record<string, number>>((acc, flight) => {
      const totalPrice = Math.round(flight.price * passengerMultiplier);

      if (!acc[flight.date] || totalPrice < acc[flight.date]) {
        acc[flight.date] = totalPrice;
      }

      return acc;
    }, {});

    const response = Object.entries(pricesByDate)
      .map(([date, price]) => ({
        date,
        price,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return HttpResponse.json(response);
  }),

  http.get('/api/flights', ({ request }) => {
    const url = new URL(request.url);

    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const date = url.searchParams.get('date');

    if (!origin || !destination || !date) {
      return HttpResponse.json({ message: 'Некорректные параметры запроса' }, { status: 400 });
    }

    const passengerMultiplier = getPassengerMultiplier(url);

    const response = flightsMock
      .filter((flight) => {
        return (
          flight.origin === origin && flight.destination === destination && flight.date === date
        );
      })
      .map((flight) => ({
        ...flight,
        price: Math.round(flight.price * passengerMultiplier),
        originalPrice: Math.round(flight.originalPrice * passengerMultiplier),
      }))
      .sort((a, b) => a.price - b.price);

    return HttpResponse.json(response);
  }),
];
