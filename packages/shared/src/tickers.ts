export const TICKERS = ['PETR4', 'TAEE4', 'BBSE3'] as const;

export type Ticker = (typeof TICKERS)[number];

export function isTicker(value: string): value is Ticker {
  return (TICKERS as readonly string[]).includes(value);
}
