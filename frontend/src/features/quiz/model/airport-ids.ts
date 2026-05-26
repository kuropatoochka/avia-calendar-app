import type { DestinationKey } from './types';
import FlightService from '@/shared/api/service/flight-service';

/**
 * Airport IDs for each destination key — real DB (seed_data.sql).
 * Москва не включена как назначение сюда — она хаб для составных маршрутов.
 */
export const DEST_AIRPORT_REAL: Partial<Record<DestinationKey, number[]>> = {
  moscow: [1, 2, 3], // SVO + DME + VKO
  spb: [4], // Пулково (LED)
  sochi: [5], // Адлер (AER)
  kazan: [6], // Казань (KZN)
  ekb: [7], // Кольцово (SVX)
  novosib: [8], // Толмачёво (OVB)
  krasnodar: [9], // Пашковский (KRR)
  vladivostok: [10], // Кневичи (VVO)
  kaliningrad: [11], // Храброво (KGD)
  mineralvody: [12], // Минеральные Воды (MRV)
  ufa: [13], // Уфа (UFA)
  irkutsk: [14], // Иркутск (IKT)
  khabarovsk: [15], // Новый (KHV)
  krasnoyarsk: [16], // Емельяново (KJA)
  nnov: [17], // Стригино (GOJ)
  samara: [18], // Курумоч (KUF)
  omsk: [19], // Центральный (OMS)
  perm: [20], // Большое Савино (PEE)
  tyumen: [21], // Рощино (TJM)
  murmansk: [22], // Мурманск (MMK)
  karelia: [23], // Бесовец (PES) — Петрозаводск
  altai: [24], // Горно-Алтайск (RGK)
  baikal: [25], // Байкал (UUD) — Улан-Удэ
  kamchatka: [26], // Елизово (PKC) — Петропавловск-Камчатский
  dagestan: [27], // Уйташ (MCX) — Махачкала
};

/** Mock airport IDs (MSW / generateFlights) */
export const DEST_AIRPORT_MOCK: Partial<Record<DestinationKey, number[]>> = {
  moscow: [101],
  spb: [104],
  sochi: [109],
  kazan: [107],
  ekb: [106],
  novosib: [105],
  krasnodar: [108],
  vladivostok: [112],
  samara: [110],
  ufa: [111],
  irkutsk: [201],
  khabarovsk: [202],
  krasnoyarsk: [203],
  murmansk: [204],
  kaliningrad: [205],
  omsk: [206],
  perm: [207],
  tyumen: [208],
  mineralvody: [209],
  nnov: [210],
  karelia: [211],
  altai: [212],
  baikal: [213],
  kamchatka: [214],
  dagestan: [215],
};

/** Moscow airport IDs (real DB) */
export const MOSCOW_AIRPORT_IDS = [1, 2, 3] as const; // SVO, DME, VKO

/** Moscow mock airport ID */
export const MOSCOW_MOCK_AIRPORT_ID = 101;

// ─────────────────────────────────────────────────────────────────
// Утилита: найти аэропорт Москвы с минимальной ценой до назначения
// ─────────────────────────────────────────────────────────────────

export interface CheapestPair {
  fromId: number;
  toId: number;
}

/**
 * Перебирает все пары (fromIds × toIds) через /api прокси и возвращает
 * пару с минимальной ценой. Если API недоступен — null.
 */
export async function findCheapestAirportPair(
  fromIds: number[],
  toIds: number[],
  fromDate: string,
  toDate: string,
): Promise<CheapestPair | null> {
  const pairs = fromIds.flatMap((f) => toIds.filter((t) => t !== f).map((t) => ({ f, t })));
  if (pairs.length === 0) return null;

  const results = await Promise.all(
    pairs.map(async ({ f, t }) => {
      try {
        const data = await FlightService.getPriceDynamics({
          airport_from: f,
          airport_to: t,
          from_date: fromDate,
          to_date: toDate,
          passengers_number: 1,
          service_class: 'BUDGET',
        });
        const prices = data
          .map((r) => r.min_total_price)
          .filter((p): p is number => p != null && p > 0);
        return prices.length > 0 ? { price: Math.min(...prices), fromId: f, toId: t } : null;
      } catch {
        return null;
      }
    }),
  );

  const valid = results.filter(
    (r): r is { price: number; fromId: number; toId: number } => r !== null,
  );
  if (valid.length === 0) return null;
  const best = valid.reduce((a, b) => (b.price < a.price ? b : a));
  return { fromId: best.fromId, toId: best.toId };
}
