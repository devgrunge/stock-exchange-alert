import type { Quote, Ticker } from '@repo/shared';

export interface QuoteProvider {
  readonly name: string;
  fetchQuotes(tickers: Ticker[]): Promise<Quote[]>;
}
