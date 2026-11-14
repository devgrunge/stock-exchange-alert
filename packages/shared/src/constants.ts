// Thresholds for alert evaluation
export const DROP_THRESHOLD = 0.9; // price <= 90% of purchase price triggers drop alert
export const DROP_RECOVER = 0.92; // hysteresis: reset drop alert when price recovers above 92%
export const TARGET_APPROACH = 0.98; // price >= 98% of target triggers target alert
export const TARGET_RECOVER = 0.96; // hysteresis: reset target alert when price falls below 96%

// How often the scheduler checks quotes (milliseconds)
export const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// B3 trading session (America/Sao_Paulo)
export const TRADING_START_HOUR = 10;
export const TRADING_END_HOUR = 17;

export const CURRENCY = 'BRL';
