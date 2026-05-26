import type { DestinationKey } from '../model/types';
import {
  CrownFilled,
  EnvironmentFilled,
  FireFilled,
  StarFilled,
  SunFilled,
  ThunderboltFilled,
} from '@ant-design/icons';
import { Dropdown, Spin } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import FlightService from '@/shared/api/service/flight-service';
import { PATHS } from '@/shared/consts';
import { useHoverOnMount } from '@/shared/hooks';
import { DESTINATIONS } from '../model/quiz-data';
import { AnimatedEmoji } from './animated-emoji';
import styles from './deals-screen.module.css';

// ─────────────────────────────────────────────────
// Category tags — same labels & icons as offer page
// ─────────────────────────────────────────────────

type DealCategory = 'sea' | 'warm' | 'nature' | 'active' | 'cultural' | 'vibe';

const DEAL_TAGS: { id: DealCategory; label: string; icon?: React.ReactElement }[] = [
  {
    id: 'sea',
    label: 'Море и пляж',
    icon: React.createElement(SunFilled, { style: { color: '#F2B705' } }),
  },
  {
    id: 'warm',
    label: 'Тепло',
    icon: React.createElement(FireFilled, { style: { color: '#FF6B4A' } }),
  },
  {
    id: 'nature',
    label: 'Природа',
    icon: React.createElement(EnvironmentFilled, { style: { color: '#4DAA57' } }),
  },
  {
    id: 'active',
    label: 'Активно',
    icon: React.createElement(ThunderboltFilled, { style: { color: '#F59E0B' } }),
  },
  {
    id: 'cultural',
    label: 'Культурно',
    icon: React.createElement(CrownFilled, { style: { color: '#7C3AED' } }),
  },
  {
    id: 'vibe',
    label: 'Атмосферно',
    icon: React.createElement(StarFilled, { style: { color: '#516FD4' } }),
  },
];

const DEST_CATEGORIES: Partial<Record<DestinationKey, DealCategory[]>> = {
  // Море и пляж — только туда, где реально купаются
  sochi: ['sea', 'warm', 'nature'], // субтропики, заповедник, водопады
  vladivostok: ['sea', 'active', 'vibe'], // Японское море, сопки, морепродукты
  krasnodar: ['sea', 'warm', 'nature'], // Краснодарский край — леса, горы
  dagestan: ['sea', 'warm', 'nature', 'active', 'vibe'], // горы, ущелья, аулы

  // Тепло без пляжа
  mineralvody: ['warm', 'nature', 'active'], // Кавказ, Эльбрус рядом
  kazan: ['warm', 'cultural', 'vibe'], // кремль, мечеть, татарская атмосфера
  samara: ['warm', 'cultural', 'vibe'], // волжская набережная
  ufa: ['warm', 'cultural', 'nature', 'active'], // Урал рядом, башкирские леса

  // Природа
  karelia: ['nature', 'active', 'vibe'],
  baikal: ['nature', 'active', 'vibe'],
  murmansk: ['nature', 'active', 'vibe'],
  altai: ['nature', 'active', 'vibe'], // Катунь, горы, алтайская атмосфера
  irkutsk: ['nature', 'cultural', 'vibe'], // Байкал рядом, декабристы
  krasnoyarsk: ['nature', 'active', 'vibe'], // Столбы, Енисей
  kamchatka: ['nature', 'active', 'vibe'],

  // Культурно
  spb: ['cultural', 'vibe'],
  kaliningrad: ['cultural', 'vibe'],
  nnov: ['cultural', 'vibe'], // кремль, Нижегородская ярмарка
  ekb: ['cultural', 'vibe'], // граница Европы и Азии
  perm: ['cultural', 'vibe'], // Пермский звериный стиль
  novosib: ['cultural'],
  omsk: ['cultural', 'vibe'],
  tyumen: ['cultural', 'nature', 'active'], // термальные источники
  khabarovsk: ['cultural', 'active', 'vibe'],
};

// ─────────────────────────────────────────────────
// Real API mode — controlled by VITE_DATA_SOURCE env var
// Airport IDs match the real database seed (seed_data.sql)
// ─────────────────────────────────────────────────

const USE_REAL_API = import.meta.env.VITE_DATA_SOURCE !== 'mock';

// Real DB airport IDs (PostgreSQL seed_data.sql).
// Массив — у Москвы три аэропорта, запросы идут по всем, берётся минимальная цена.
const DEST_AIRPORT_REAL: Partial<Record<DestinationKey, number[]>> = {
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

// Mock airport IDs (MSW / generateFlights)
const DEST_AIRPORT_MOCK: Partial<Record<DestinationKey, number[]>> = {
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

const DEST_AIRPORT = USE_REAL_API ? DEST_AIRPORT_REAL : DEST_AIRPORT_MOCK;

// ─────────────────────────────────────────────────
// Origin cities for departure selector
// ─────────────────────────────────────────────────

type OriginKey = 'moscow' | DestinationKey;

interface OriginCity {
  key: OriginKey;
  name: string; // nominative (for picker)
  nameFrom: string; // genitive (for "Перелёты из X")
  airportIds: number[]; // all airports of this city (Moscow has 3)
}

// Real DB airport IDs — all 25 cities. Moscow uses all 3 airports (SVO+DME+VKO)
// so that routes via Domodedovo (e.g. to Краснодар) are also covered.
const ORIGIN_CITIES_REAL: OriginCity[] = [
  { key: 'moscow', name: 'Москва', nameFrom: 'Москвы', airportIds: [1, 2, 3] },
  { key: 'spb', name: 'Санкт-Петербург', nameFrom: 'Санкт-Петербурга', airportIds: [4] },
  { key: 'sochi', name: 'Сочи', nameFrom: 'Сочи', airportIds: [5] },
  { key: 'kazan', name: 'Казань', nameFrom: 'Казани', airportIds: [6] },
  { key: 'ekb', name: 'Екатеринбург', nameFrom: 'Екатеринбурга', airportIds: [7] },
  { key: 'novosib', name: 'Новосибирск', nameFrom: 'Новосибирска', airportIds: [8] },
  { key: 'krasnodar', name: 'Краснодар', nameFrom: 'Краснодара', airportIds: [9] },
  { key: 'vladivostok', name: 'Владивосток', nameFrom: 'Владивостока', airportIds: [10] },
  { key: 'kaliningrad', name: 'Калининград', nameFrom: 'Калининграда', airportIds: [11] },
  { key: 'mineralvody', name: 'Минеральные Воды', nameFrom: 'Минеральных Вод', airportIds: [12] },
  { key: 'ufa', name: 'Уфа', nameFrom: 'Уфы', airportIds: [13] },
  { key: 'irkutsk', name: 'Иркутск', nameFrom: 'Иркутска', airportIds: [14] },
  { key: 'khabarovsk', name: 'Хабаровск', nameFrom: 'Хабаровска', airportIds: [15] },
  { key: 'krasnoyarsk', name: 'Красноярск', nameFrom: 'Красноярска', airportIds: [16] },
  { key: 'nnov', name: 'Нижний Новгород', nameFrom: 'Нижнего Новгорода', airportIds: [17] },
  { key: 'samara', name: 'Самара', nameFrom: 'Самары', airportIds: [18] },
  { key: 'omsk', name: 'Омск', nameFrom: 'Омска', airportIds: [19] },
  { key: 'perm', name: 'Пермь', nameFrom: 'Перми', airportIds: [20] },
  { key: 'tyumen', name: 'Тюмень', nameFrom: 'Тюмени', airportIds: [21] },
  { key: 'murmansk', name: 'Мурманск', nameFrom: 'Мурманска', airportIds: [22] },
  { key: 'karelia', name: 'Карелия', nameFrom: 'Карелии', airportIds: [23] },
  { key: 'altai', name: 'Алтай', nameFrom: 'Алтая', airportIds: [24] },
  { key: 'baikal', name: 'Байкал', nameFrom: 'Байкала', airportIds: [25] },
  { key: 'kamchatka', name: 'Камчатка', nameFrom: 'Камчатки', airportIds: [26] },
  { key: 'dagestan', name: 'Дагестан', nameFrom: 'Дагестана', airportIds: [27] },
];

// Mock: all 25 cities with their mock airport IDs
const ORIGIN_CITIES_MOCK: OriginCity[] = [
  { key: 'moscow', name: 'Москва', nameFrom: 'Москвы', airportIds: [101] },
  { key: 'spb', name: 'Санкт-Петербург', nameFrom: 'Санкт-Петербурга', airportIds: [104] },
  { key: 'sochi', name: 'Сочи', nameFrom: 'Сочи', airportIds: [109] },
  { key: 'kazan', name: 'Казань', nameFrom: 'Казани', airportIds: [107] },
  { key: 'ekb', name: 'Екатеринбург', nameFrom: 'Екатеринбурга', airportIds: [106] },
  { key: 'novosib', name: 'Новосибирск', nameFrom: 'Новосибирска', airportIds: [105] },
  { key: 'krasnodar', name: 'Краснодар', nameFrom: 'Краснодара', airportIds: [108] },
  { key: 'vladivostok', name: 'Владивосток', nameFrom: 'Владивостока', airportIds: [112] },
  { key: 'kaliningrad', name: 'Калининград', nameFrom: 'Калининграда', airportIds: [205] },
  { key: 'mineralvody', name: 'Минеральные Воды', nameFrom: 'Минеральных Вод', airportIds: [209] },
  { key: 'ufa', name: 'Уфа', nameFrom: 'Уфы', airportIds: [111] },
  { key: 'irkutsk', name: 'Иркутск', nameFrom: 'Иркутска', airportIds: [201] },
  { key: 'khabarovsk', name: 'Хабаровск', nameFrom: 'Хабаровска', airportIds: [202] },
  { key: 'krasnoyarsk', name: 'Красноярск', nameFrom: 'Красноярска', airportIds: [203] },
  { key: 'nnov', name: 'Нижний Новгород', nameFrom: 'Нижнего Новгорода', airportIds: [210] },
  { key: 'samara', name: 'Самара', nameFrom: 'Самары', airportIds: [110] },
  { key: 'omsk', name: 'Омск', nameFrom: 'Омска', airportIds: [206] },
  { key: 'perm', name: 'Пермь', nameFrom: 'Перми', airportIds: [207] },
  { key: 'tyumen', name: 'Тюмень', nameFrom: 'Тюмени', airportIds: [208] },
  { key: 'murmansk', name: 'Мурманск', nameFrom: 'Мурманска', airportIds: [204] },
  { key: 'karelia', name: 'Карелия', nameFrom: 'Карелии', airportIds: [211] },
  { key: 'altai', name: 'Алтай', nameFrom: 'Алтая', airportIds: [212] },
  { key: 'baikal', name: 'Байкал', nameFrom: 'Байкала', airportIds: [213] },
  { key: 'kamchatka', name: 'Камчатка', nameFrom: 'Камчатки', airportIds: [214] },
  { key: 'dagestan', name: 'Дагестан', nameFrom: 'Дагестана', airportIds: [215] },
];

const ORIGIN_CITIES = USE_REAL_API ? ORIGIN_CITIES_REAL : ORIGIN_CITIES_MOCK;

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

interface SegmentResult {
  price: number;
  fromId: number;
  toId: number;
}

interface DealItem {
  key: DestinationKey;
  name: string;
  emoji: string;
  tagline: string;
  minPrice: number;
  categories: DealCategory[];
  /** Конкретный аэропорт отправления с минимальной ценой (для перехода на offer) */
  winOriginAirportId: number;
  /** Конкретный аэропорт прибытия с минимальной ценой (для перехода на offer) */
  winDestAirportId: number;
}

interface DealsScreenProps {
  result: DestinationKey | null;
  onRestart: () => void;
}

// ─────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────

export const DealsScreen = ({ result, onRestart }: DealsScreenProps) => {
  const navigate = useNavigate();
  const restartHover = useHoverOnMount();
  const [activeTags, setActiveTags] = useState<Set<DealCategory>>(new Set());
  const [originKey, setOriginKey] = useState<OriginKey>('moscow');
  const [allDeals, setAllDeals] = useState<DealItem[]>([]);
  // isLoading выводится из несовпадения originKey и уже загруженного ключа —
  // не нужен синхронный setState внутри эффекта
  const [settledOriginKey, setSettledOriginKey] = useState<OriginKey | null>(null);
  const isLoading = settledOriginKey !== originKey;

  // Диапазон дат для поиска — «сегодня + 1 месяц», вычисляется один раз при монтировании
  const { fromDate, toDate } = useRef(
    (() => {
      const today = new Date();
      return {
        fromDate: today.toISOString().slice(0, 10),
        toDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
          .toISOString()
          .slice(0, 10),
      };
    })(),
  ).current;

  const originCity = ORIGIN_CITIES.find((c) => c.key === originKey)!;

  useEffect(() => {
    let cancelled = false;

    const entries = (Object.entries(DEST_AIRPORT) as [DestinationKey, number[]][]).filter(
      ([key]) => (key as string) !== originKey,
    );

    // Хаб для составных маршрутов — Москва (SVO + DME + VKO).
    // В mock-режиме хаб не нужен: MSW генерирует цены для любой пары.
    const HUB_IDS = USE_REAL_API ? [1, 2, 3] : [];

    // ── Низкоуровневая функция: минимальная цена + победившая пара аэропортов ──
    const fetchSegmentPrice = async (
      fromIds: number[],
      toIds: number[],
    ): Promise<SegmentResult | null> => {
      if (USE_REAL_API) {
        // Перебираем все пары через /api прокси (работает и в Vite dev, и на Vercel)
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
              return prices.length > 0
                ? ({ price: Math.min(...prices), fromId: f, toId: t } satisfies SegmentResult)
                : null;
            } catch {
              return null;
            }
          }),
        );
        const valid = results.filter((r): r is SegmentResult => r !== null);
        if (valid.length === 0) return null;
        return valid.reduce((best, r) => (r.price < best.price ? r : best));
      }
      // MSW mock — победившая пара = первые элементы массивов
      try {
        const range = await FlightService.getPriceDynamics({
          airport_from: fromIds[0],
          airport_to: toIds[0],
          from_date: fromDate,
          to_date: toDate,
          passengers_number: 1,
          service_class: 'BUDGET',
        });
        const prices = range
          .map((r) => r.min_total_price)
          .filter((p): p is number => p != null && p > 0);
        return prices.length > 0
          ? { price: Math.min(...prices), fromId: fromIds[0], toId: toIds[0] }
          : null;
      } catch {
        return null;
      }
    };

    void (async () => {
      // ── Предзагружаем цену отправление → Москва один раз для всех назначений ──
      const originIsHub = HUB_IDS.some((id) => originCity.airportIds.includes(id));
      const originToHub = originIsHub
        ? null
        : await fetchSegmentPrice(originCity.airportIds, HUB_IDS);

      if (cancelled) return;

      // ── Для каждого назначения параллельно: прямой + составной маршрут ──
      const results = await Promise.all(
        entries.map(async ([key, destIds]) => {
          const dest = DESTINATIONS[key];
          if (!dest) return null;
          try {
            const destIsHub = HUB_IDS.some((id) => destIds.includes(id));

            const [directResult, hubToDestResult] = await Promise.all([
              fetchSegmentPrice(originCity.airportIds, destIds),
              !originIsHub && !destIsHub && originToHub !== null
                ? fetchSegmentPrice(HUB_IDS, destIds)
                : Promise.resolve(null),
            ]);

            const compositePrice =
              originToHub !== null && hubToDestResult !== null
                ? originToHub.price + hubToDestResult.price
                : null;

            // Выбираем лучший вариант и сохраняем конкретные аэропорты
            let minPrice: number | null = null;
            let winOriginAirportId = originCity.airportIds[0];
            let winDestAirportId = destIds[0];

            if (
              directResult !== null &&
              (compositePrice === null || directResult.price <= compositePrice)
            ) {
              minPrice = directResult.price;
              winOriginAirportId = directResult.fromId;
              winDestAirportId = directResult.toId;
            } else if (compositePrice !== null) {
              minPrice = compositePrice;
              // При составном маршруте: отправляемся из аэропорта с min ценой до хаба,
              // прилетаем в аэропорт назначения с min ценой от хаба
              winOriginAirportId = originToHub!.fromId;
              winDestAirportId = hubToDestResult!.toId;
            }

            if (minPrice === null) return null;
            return {
              key,
              name: dest.name,
              emoji: dest.emoji,
              tagline: dest.tagline,
              minPrice,
              categories: DEST_CATEGORIES[key] ?? [],
              winOriginAirportId,
              winDestAirportId,
            } as DealItem;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) return;
      setAllDeals(
        results.filter((d): d is DealItem => d !== null).sort((a, b) => a.minPrice - b.minPrice),
      );
      setSettledOriginKey(originKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [originKey]); // originCity меняется вместе с originKey

  // AND-logic: destination must match ALL active tags
  const visibleDeals = useMemo(() => {
    if (activeTags.size === 0) return allDeals;
    return allDeals.filter((d) => [...activeTags].every((tag) => d.categories.includes(tag)));
  }, [allDeals, activeTags]);

  const toggleTag = (tag: DealCategory) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleCardClick = (deal: DealItem) => {
    const params = new URLSearchParams({
      from: String(deal.winOriginAirportId),
      to: String(deal.winDestAirportId),
      dateFrom: fromDate,
      dateTo: toDate,
    });
    void navigate(`${PATHS.offer}?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.body}>
        {/* ── Header ── */}
        <div className={styles.header}>
          {result && <p className={styles.eyebrow}>всё ещё сомневаешься?</p>}
          <h2 className={styles.title}>Все направления — по цене</h2>
          <p className={styles.subtitle}>
            Перелёты из{' '}
            <Dropdown
              trigger={['click']}
              placement="bottomLeft"
              autoAdjustOverflow={false}
              menu={{
                items: ORIGIN_CITIES.map((city) => ({
                  key: city.key,
                  label: city.name,
                })),
                selectedKeys: [originKey],
                onClick: ({ key }) => setOriginKey(key as OriginKey),
                style: { maxHeight: 260, overflowY: 'auto' },
              }}
            >
              <button type="button" className={styles.originButton}>
                {originCity.nameFrom}
              </button>
            </Dropdown>{' '}
            · бюджетный класс · 1 пассажир
          </p>
        </div>

        {/* ── Filter tags ── */}
        <div className={styles.tagsRow}>
          {DEAL_TAGS.map((tag) => {
            const active = activeTags.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={`${styles.tag} ${active ? styles.tagActive : ''}`}
                onClick={() => toggleTag(tag.id)}
                aria-pressed={active}
              >
                {tag.icon}
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* ── Deals list ── */}
        <div className={styles.list}>
          {isLoading && (
            <div className={styles.loadingState}>
              <Spin size="small" />
              <span>Загружаем цены…</span>
            </div>
          )}
          {!isLoading && visibleDeals.length === 0 && (
            <p className={styles.empty}>Нет направлений по выбранным фильтрам</p>
          )}
          {!isLoading &&
            visibleDeals.map((deal) => {
              const isResult = deal.key === result;
              return (
                <button
                  key={deal.key}
                  className={`${styles.card} ${isResult ? styles.cardHighlighted : ''}`}
                  onClick={() => handleCardClick(deal)}
                >
                  <AnimatedEmoji emoji={deal.emoji} className={styles.cardEmoji} />

                  <div className={styles.cardInfo}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{deal.name}</span>
                      {isResult && <span className={styles.resultBadge}>твой результат</span>}
                    </div>
                    <span className={styles.cardTagline}>{deal.tagline}</span>
                  </div>

                  <span className={styles.cardPrice}>
                    от {priceFormatter.format(deal.minPrice)}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
      {/* end .body */}

      {/* ── Footer — вне анимации, чтобы :hover работал сразу ── */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.restartButton}
          onClick={onRestart}
          {...restartHover}
        >
          {result ? 'Пройти опрос заново' : 'Пройти опрос'}
        </button>
      </div>
    </div>
  );
};
