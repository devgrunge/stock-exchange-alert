import type { Ticker } from './tickers';

export interface Quote {
  ticker: Ticker;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  updatedAt: string; // ISO 8601
  source: string;
}

export interface AssetConfig {
  ticker: Ticker;
  purchasePrice: number | null;
  targetPrice: number | null;
  dropAlertEnabled: boolean;
  targetAlertEnabled: boolean;
}

export interface AlertState {
  ticker: Ticker;
  dropAlerted: boolean;
  targetAlerted: boolean;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export type AlertKind = 'drop' | 'target';

export interface AlertEvent {
  ticker: Ticker;
  kind: AlertKind;
  price: number;
  reference: number;
  message: string;
}
