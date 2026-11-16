import type { Quote, Ticker } from '@repo/shared';
import type { QuoteProvider } from './quote-provider';

interface BrapiQuoteItem {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen?: number | null;
  currency?: string;
  regularMarketTime?: string;
}

interface BrapiQuoteResponse {
  results?: BrapiQuoteItem[];
  error?: boolean;
  message?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BrapiProvider implements QuoteProvider {
  readonly name = 'brapi';

  constructor(
    private readonly token = '',
    private readonly baseUrl = 'https://brapi.dev',
  ) {}

  async fetchQuotes(tickers: Ticker[]): Promise<Quote[]> {
    // Fetch sequentially to avoid tripping brapi's burst rate limit.
    const quotes: Quote[] = [];
    for (const ticker of tickers) {
      quotes.push(await this.fetchOneWithRetry(ticker));
      await delay(400);
    }
    return quotes;
  }

  private async fetchOneWithRetry(ticker: Ticker, attempts = 3): Promise<Quote> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await this.fetchOne(ticker);
      } catch (err) {
        lastError = err;
        if (i < attempts - 1) {
          await delay(1000 * (i + 1)); // 1s, then 2s backoff
        }
      }
    }
    throw lastError;
  }

  private async fetchOne(ticker: Ticker): Promise<Quote> {
    const base = this.baseUrl.replace(/\/+$/, '');
    const url = new URL(`${base}/api/quote/${ticker}`);
    if (this.token) url.searchParams.set('token', this.token);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`brapi request failed for ${ticker}: HTTP ${res.status}`);
      }

      const data = (await res.json()) as BrapiQuoteResponse;
      if (data.error) {
        throw new Error(`brapi error for ${ticker}: ${data.message ?? 'unknown error'}`);
      }

      const item = data.results?.[0];
      if (!item) {
        throw new Error(`brapi returned no data for ${ticker}`);
      }

      return {
        ticker,
        price: item.regularMarketPrice,
        change: item.regularMarketChange,
        changePercent: item.regularMarketChangePercent,
        open: item.regularMarketOpen ?? null,
        currency: item.currency ?? 'BRL',
        updatedAt: item.regularMarketTime
          ? new Date(item.regularMarketTime).toISOString()
          : new Date().toISOString(),
        source: this.name,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
