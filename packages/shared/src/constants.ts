// Intraday alert threshold: alert fires when the price moves ±10%
// relative to the day's opening price.
export const INTRADAY_MOVE_PCT = 0.1;
export const DROP_THRESHOLD = 1 - INTRADAY_MOVE_PCT; // price <= open * 0.9
export const RISE_THRESHOLD = 1 + INTRADAY_MOVE_PCT; // price >= open * 1.1

// How often the scheduler checks quotes (milliseconds)
export const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// B3 trading session (America/Sao_Paulo)
export const TRADING_START_HOUR = 10;
export const TRADING_END_HOUR = 17;

export const CURRENCY = 'BRL';
