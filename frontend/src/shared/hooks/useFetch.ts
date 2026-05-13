import { useCallback, useState } from 'react';

export const useFetch = <Args extends unknown[], Result>(
  callback: (...args: Args) => Promise<Result>,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetching = useCallback(
    async (...args: Args): Promise<Result | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        return await callback(...args);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
        setError(errorMessage);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [callback],
  );

  return [fetching, isLoading, error] as const;
};
