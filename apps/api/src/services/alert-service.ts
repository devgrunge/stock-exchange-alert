import { DROP_THRESHOLD, RISE_THRESHOLD } from '@repo/shared';
import type { AlertEvent, Quote } from '@repo/shared';
import {
  getAlertState,
  getConfig,
  resetAlertState,
  setDropAlerted,
  setRiseAlerted,
} from '../db';
import { env } from '../env';

/** Returns the trading day (YYYY-MM-DD) of a quote in the configured timezone. */
function tradeDateOf(quote: Quote): string | null {
  const date = new Date(quote.updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: env.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function evaluateAlerts(quotes: Quote[]): AlertEvent[] {
  const events: AlertEvent[] = [];
  const configs = getConfig();

  for (const quote of quotes) {
    const config = configs.find((c) => c.ticker === quote.ticker);
    if (!config) continue;

    // The reference is the day's opening price. Skip if unavailable.
    if (quote.open == null || quote.open <= 0) continue;

    const tradeDate = tradeDateOf(quote);
    if (!tradeDate) continue;

    const state = getAlertState(quote.ticker);
    let dropAlerted = state.dropAlerted;
    let riseAlerted = state.riseAlerted;

    // New trading day: reset the "already alerted" flags.
    if (state.tradeDate !== tradeDate) {
      resetAlertState(quote.ticker, tradeDate);
      dropAlerted = false;
      riseAlerted = false;
    }

    // Drop: price <= open * 0.9 (fell 10% from the opening)
    if (config.dropAlertEnabled && !dropAlerted && quote.price <= quote.open * DROP_THRESHOLD) {
      setDropAlerted(quote.ticker, true);
      const pct = (quote.price / quote.open - 1) * 100;
      events.push({
        ticker: quote.ticker,
        kind: 'drop',
        price: quote.price,
        reference: quote.open,
        message: `${quote.ticker} caiu ${Math.abs(pct).toFixed(1)}% no dia: de R$ ${quote.open.toFixed(
          2,
        )} (abertura) para R$ ${quote.price.toFixed(2)}`,
      });
    }

    // Rise: price >= open * 1.1 (rose 10% from the opening)
    if (config.riseAlertEnabled && !riseAlerted && quote.price >= quote.open * RISE_THRESHOLD) {
      setRiseAlerted(quote.ticker, true);
      const pct = (quote.price / quote.open - 1) * 100;
      events.push({
        ticker: quote.ticker,
        kind: 'rise',
        price: quote.price,
        reference: quote.open,
        message: `${quote.ticker} subiu ${pct.toFixed(1)}% no dia: de R$ ${quote.open.toFixed(
          2,
        )} (abertura) para R$ ${quote.price.toFixed(2)}`,
      });
    }
  }

  return events;
}
