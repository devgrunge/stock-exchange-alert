import type { Ticker } from './tickers';

export interface Quote {
  ticker: Ticker;
  price: number;
  change: number;
  changePercent: number;
  open: number | null; // day's opening price
  currency: string;
  updatedAt: string; // ISO 8601
  source: string;
}

export interface AssetConfig {
  ticker: Ticker;
  dropAlertEnabled: boolean;
  riseAlertEnabled: boolean;
}

export interface AlertState {
  ticker: Ticker;
  tradeDate: string; // YYYY-MM-DD (America/Sao_Paulo)
  dropAlerted: boolean;
  riseAlerted: boolean;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type AlertKind = 'drop' | 'rise';

export interface AlertEvent {
  ticker: Ticker;
  kind: AlertKind;
  price: number;
  reference: number; // day's opening price
  message: string;
}
