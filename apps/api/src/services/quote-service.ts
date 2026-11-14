import { TICKERS } from '@repo/shared';
import type { Quote, Ticker } from '@repo/shared';
import type { QuoteProvider } from '../providers/quote-provider';

export class QuoteService {
  private cache = new Map<Ticker, Quote>();
  private lastRefresh: Date | null = null;
  private refreshPromise: Promise<Quote[]> | null = null;

  constructor(private readonly provider: QuoteProvider) {}

  getLatest(): Quote[] {
    return TICKERS.map((ticker) => this.cache.get(ticker)).filter(
      (quote): quote is Quote => quote !== undefined,
    );
  }

  getLastRefresh(): Date | null {
    return this.lastRefresh;
  }

  /** Deduplicates concurrent refreshes (e.g. boot warm-up + scheduler tick). */
  refresh(): Promise<Quote[]> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.doRefresh().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<Quote[]> {
    const quotes = await this.provider.fetchQuotes([...TICKERS]);
    for (const quote of quotes) {
      this.cache.set(quote.ticker, quote);
    }
    this.lastRefresh = new Date();
    return quotes;
  }
}
