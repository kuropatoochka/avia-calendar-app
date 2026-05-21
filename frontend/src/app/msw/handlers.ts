import { airportHandlers, flightHandlers, companyHandlers } from '@/shared/api';

export const handlers = [...airportHandlers, ...flightHandlers, ...companyHandlers];
