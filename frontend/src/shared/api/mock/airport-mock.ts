import type { AirportDto } from '../../types/api';

const airportCities = {
  moscow: { id: 1, name: 'Москва' },
  spb: { id: 2, name: 'Санкт-Петербург' },
  novosibirsk: { id: 3, name: 'Новосибирск' },
  ekaterinburg: { id: 4, name: 'Екатеринбург' },
  kazan: { id: 5, name: 'Казань' },
  krasnodar: { id: 6, name: 'Краснодар' },
  sochi: { id: 7, name: 'Сочи' },
  samara: { id: 8, name: 'Самара' },
  ufa: { id: 9, name: 'Уфа' },
  vladivostok: { id: 10, name: 'Владивосток' },
  novokuznetsk: { id: 11, name: 'Новокузнецк' },
  rostov: { id: 12, name: 'Ростов-на-Дону' },
};

export const airportMock: AirportDto[] = [
  { id: 101, name: 'Шереметьево', city: airportCities.moscow },
  { id: 102, name: 'Домодедово', city: airportCities.moscow },
  { id: 103, name: 'Внуково', city: airportCities.moscow },
  { id: 104, name: 'Пулково', city: airportCities.spb },
  { id: 105, name: 'Толмачёво', city: airportCities.novosibirsk },
  { id: 106, name: 'Кольцово', city: airportCities.ekaterinburg },
  { id: 107, name: 'Казань', city: airportCities.kazan },
  { id: 108, name: 'Пашковский', city: airportCities.krasnodar },
  { id: 109, name: 'Адлер', city: airportCities.sochi },
  { id: 110, name: 'Курумоч', city: airportCities.samara },
  { id: 111, name: 'Уфа', city: airportCities.ufa },
  { id: 112, name: 'Кневичи', city: airportCities.vladivostok },
  { id: 113, name: 'Спиченково', city: airportCities.novokuznetsk },
  { id: 114, name: 'Платов', city: airportCities.rostov },
];
