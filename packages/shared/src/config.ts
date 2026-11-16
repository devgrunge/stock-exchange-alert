import { TICKERS } from './tickers';
import type { Ticker } from './tickers';
import type { AssetConfig } from './types';

export function defaultAssetConfig(ticker: Ticker): AssetConfig {
  return {
    ticker,
    dropAlertEnabled: true,
    riseAlertEnabled: true,
  };
}

export const DEFAULT_CONFIG: AssetConfig[] = TICKERS.map(defaultAssetConfig);
