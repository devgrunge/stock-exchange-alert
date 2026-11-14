import {
  DROP_RECOVER,
  DROP_THRESHOLD,
  TARGET_APPROACH,
  TARGET_RECOVER,
} from '@repo/shared';
import type { AlertEvent, Quote } from '@repo/shared';
import {
  getAlertState,
  getConfig,
  setDropAlerted,
  setTargetAlerted,
} from '../db';

export function evaluateAlerts(quotes: Quote[]): AlertEvent[] {
  const events: AlertEvent[] = [];
  const configs = getConfig();

  for (const quote of quotes) {
    const config = configs.find((c) => c.ticker === quote.ticker);
    if (!config) continue;

    const state = getAlertState(quote.ticker);

    // Drop alert: price <= purchasePrice * 90%
    if (config.dropAlertEnabled && config.purchasePrice != null) {
      const dropTriggered = quote.price <= config.purchasePrice * DROP_THRESHOLD;

      if (dropTriggered && !state.dropAlerted) {
        setDropAlerted(quote.ticker, true);
        const pct = (1 - quote.price / config.purchasePrice) * 100;
        events.push({
          ticker: quote.ticker,
          kind: 'drop',
          price: quote.price,
          reference: config.purchasePrice,
          message: `${quote.ticker} caiu para R$ ${quote.price.toFixed(2)} (queda de ${pct.toFixed(
            1,
          )}% em relação ao preço de compra R$ ${config.purchasePrice.toFixed(2)})`,
        });
      } else if (!dropTriggered && quote.price > config.purchasePrice * DROP_RECOVER) {
        setDropAlerted(quote.ticker, false);
      }
    }

    // Target alert: price >= targetPrice * 98%
    if (config.targetAlertEnabled && config.targetPrice != null) {
      const targetTriggered = quote.price >= config.targetPrice * TARGET_APPROACH;

      if (targetTriggered && !state.targetAlerted) {
        setTargetAlerted(quote.ticker, true);
        events.push({
          ticker: quote.ticker,
          kind: 'target',
          price: quote.price,
          reference: config.targetPrice,
          message: `${quote.ticker} atingiu R$ ${quote.price.toFixed(
            2,
          )}, próximo do alvo R$ ${config.targetPrice.toFixed(2)}`,
        });
      } else if (!targetTriggered && quote.price < config.targetPrice * TARGET_RECOVER) {
        setTargetAlerted(quote.ticker, false);
      }
    }
  }

  return events;
}
