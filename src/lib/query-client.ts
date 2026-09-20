import { QueryClient } from '@tanstack/react-query';
import { getApiFailure } from '@/services/api/errors';
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        gcTime: 300000,
        refetchOnWindowFocus: true,
        retry: (count, error) => {
          const { status } = getApiFailure(error);
          return count < 2 && (!status || status >= 500);
        },
      },
      mutations: { retry: false },
    },
  });
}
