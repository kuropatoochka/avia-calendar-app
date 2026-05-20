import { useCallback, useEffect, useState } from 'react';
import { CompanyService } from '@/shared/api';
import type { CompanyDto } from '@/shared/types';

export const useCompaniesQuery = () => {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CompanyService.getCompanies();
      setCompanies(data.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, isLoading, error };
};
