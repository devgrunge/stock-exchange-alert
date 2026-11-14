import { useQuery } from '@tanstack/react-query';
import { fetchQuotes } from '../lib/api';

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: () => fetchQuotes(false),
    refetchInterval: 60_000,
  });
}
