import { useEffect } from 'react';
import { usePriceDynamics } from '../hooks/usePriceDynamics';

export const PriceDynamicsBlock = () => {
  const { priceDynamics, fetchPriceDynamics, isPriceDynamicsLoading, priceDynamicsError } =
    usePriceDynamics();

  useEffect(() => {
    fetchPriceDynamics({
      originAirportId: 'svo',
      destinationAirportId: 'led',
      dateFrom: '2026-05-01',
      dateTo: '2026-05-14',
      passengers: {
        adults: 1,
      },
    });
  }, [fetchPriceDynamics]);

  if (isPriceDynamicsLoading) {
    return <div>Загружаем динамику цен...</div>;
  }

  if (priceDynamicsError) {
    return <div>{priceDynamicsError}</div>;
  }

  return (
    <section>
      <h2>Динамика минимальных цен по датам</h2>
      <pre>{JSON.stringify(priceDynamics, null, 2)}</pre>
    </section>
  );
};
