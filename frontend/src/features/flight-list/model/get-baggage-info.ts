import type { BaggageOption } from './types';
import type { TicketPricesDto } from '@/shared/types';

type Params = {
  prices: TicketPricesDto;
  initialBaggageEnabled: boolean;
  baggageWeight?: number;
};

export const getBaggageOptions = ({
  prices,
  initialBaggageEnabled,
  baggageWeight = 20,
}: Params) => {
  const withBaggagePrice = initialBaggageEnabled
    ? prices.total
    : prices.total + prices.baggage_price;

  const withoutBaggagePrice = initialBaggageEnabled
    ? Math.max(prices.total - prices.baggage_price, 0)
    : prices.total;

  const withBaggage: BaggageOption = {
    enabled: true,
    label: `Багаж · ${baggageWeight} кг`,
    price: withBaggagePrice,
    weight: baggageWeight,
  };

  const withoutBaggage: BaggageOption = {
    enabled: false,
    label: 'Ручная кладь · 10 кг',
    price: withoutBaggagePrice,
    weight: 10,
  };

  return {
    withBaggage,
    withoutBaggage,
  };
};
