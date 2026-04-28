import { airportHandlers, flightHandlers } from '@/shared/api';

export const handlers = [...airportHandlers, ...flightHandlers];
