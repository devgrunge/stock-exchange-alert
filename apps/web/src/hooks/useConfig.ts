import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AssetConfig } from '@repo/shared';
import { fetchConfig, saveConfig } from '../lib/api';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
  });
}

export function useSaveConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticker, patch }: { ticker: string; patch: Partial<AssetConfig> }) =>
      saveConfig(ticker, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });
}
